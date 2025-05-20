import { IProductRepository } from "../domain/interfaces/product.interface";
import { FileReaderInterface } from "../../shared/domain/interfaces/fileReader.interface";
import { CategoryRepository } from "../../category-service/infraestructure/repository/category.repository";
import { StoreRepository } from "../../store-service/infraestructure/repository/store.repository";
import { Product } from "../domain/entity/product";
import { ProductCsvData } from "../../shared/domain/interfaces/productCsvData.interface";
import { Category } from "../../category-service/domain/entity/category";
import { Inventory } from "../../inventory-service/domain/entity/inventory";
import { IInventoryRepository } from "../../inventory-service/domain/interfaces/inventory.interface";

export class UploadProductService {
  private categoryRepository: CategoryRepository;
  private storeRepository: StoreRepository;
  private productRepository: IProductRepository;
  private inventoryRepository: IInventoryRepository;

  constructor(
    productRepository: IProductRepository,
    inventoryRepository: IInventoryRepository,
    private readonly fileReader: FileReaderInterface
  ) {
    this.categoryRepository = new CategoryRepository();
    this.storeRepository = new StoreRepository();
    this.productRepository = productRepository;
    this.inventoryRepository = inventoryRepository;
  }

  async upload<F, T>({
    file,
    separator,
  }: {
    file: F;
    separator: string;
  }): Promise<{ successCount: number; errors: string[] }> {
    const { data, error } = await this.fileReader.read<T>({
      file,
      separator,
    });

    if (error) {
      return { successCount: 0, errors: ["Could not process the file"] };
    }

    const errors: string[] = [];
    const successCount = await this.processProductsBulk(
      data as ProductCsvData[],
      errors
    );

    return { successCount, errors };
  }

  async processProductsBulk(
    data: ProductCsvData[],
    errors: string[]
  ): Promise<number> {
    // 1. Extraer categorías únicas
    const categoryNames = [
      ...new Set(data.map((p) => p.categoria.toLowerCase())),
    ];

    // 2. Cargar o crear todas las categorías de una vez
    const categories = await Promise.all(
      categoryNames.map(async (name) => {
        let cat = await this.categoryRepository.findByName(name);
        if (!cat) {
          cat = Category.createFrom({ name, description: `${name} category` });
          cat = await this.categoryRepository.create(cat);
        }
        return cat;
      })
    );
    // Crear mapa nombre -> categoryId
    const categoryMap = new Map(
      categories.map((c) => [c.name.toLowerCase(), c.id!])
    );

    // 3. Extraer almacenes únicos y cargar
    const storeIds = [...new Set(data.map((p) => p.id_almacen))];
    const stores = await Promise.all(
      storeIds.map((id) => this.storeRepository.findByIdAlmacen(id))
    );
    const storeMap = new Map(
      stores.filter(Boolean).map((s) => [s!.id_almacen, s!.id!])
    );

    // 4. Preparamos productos y validamos
    const productsToCreate: Product[] = [];
    const inventoriesToCreate: Inventory[] = [];

    for (const row of data) {
      try {
        this.validateProductData(row);

        const catId = categoryMap.get(row.categoria.toLowerCase());
        if (!catId) throw new Error(`Category ${row.categoria} not found`);

        const storeId = storeMap.get(row.id_almacen);
        if (!storeId) throw new Error(`Store ${row.id_almacen} not found`);

        const expirationDate =
          row.fecha_vencimiento &&
          !isNaN(new Date(row.fecha_vencimiento).getTime())
            ? new Date(row.fecha_vencimiento)
            : new Date();

        const lastResetDate =
          row.ultima_reposicion &&
          !isNaN(new Date(row.ultima_reposicion).getTime())
            ? new Date(row.ultima_reposicion)
            : new Date();

        const product = new Product(
          row.id_producto,
          row.id_proveedor,
          row.nombre_producto,
          row.descripcion,
          row.sku,
          catId,
          parseFloat(row.precio_unitario.toString()),
          parseFloat(row.peso_kg.toString()),
          row.es_fragil === "true",
          row.dimensiones_cm,
          "https://example.com/image.jpg",
          row.codigo_barras,
          row.requiere_refrigeracion === "true",
          expirationDate,
          row.estado === "activo" ? "ACTIVE" : "INACTIVE"
        );

        productsToCreate.push(product);

        // Creamos inventario con datos pero sin productId, se añade luego
        const inventory = new Inventory(
          0, // temporal, lo actualizamos después
          storeId,
          parseFloat(row.cantidad_stock.toString()) || 0,
          parseFloat(row.nivel_reorden.toString()) || 0,
          lastResetDate
        );
        inventoriesToCreate.push(inventory);
      } catch (err) {
        if (err instanceof Error)
          errors.push(`Error in product ${row.id_producto}: ${err.message}`);
      }
    }
    // 5. Insertar productos masivamente
    await this.productRepository.createMany(productsToCreate);

    // Extraer todos los id_producto que se intentaron crear
    const idProductos = productsToCreate.map((p) => p.id_producto);

    // 6. Buscar todos los productos (existentes y recién creados) por id_producto para obtener sus IDs
    const createdProducts =
      await this.productRepository.findByProductIds(idProductos);

    // 6. Mapear productIds creados en inventarios
    for (let i = 0; i < inventoriesToCreate.length; i++) {
      inventoriesToCreate[i].productId = createdProducts[i].id!;
    }

    // 7. Insertar inventarios masivamente
    await this.inventoryRepository.createMany(inventoriesToCreate);

    return createdProducts.length;
  }

  private validateProductData(row: ProductCsvData) {
    if (!row.id_producto || !row.nombre_producto || !row.categoria) {
      throw new Error("Product ID, name, and category are required.");
    }

    if (isNaN(row.precio_unitario)) {
      throw new Error("Unit price must be a valid number.");
    }

    if (!row.codigo_barras) {
      throw new Error("Bar code is required.");
    }

    if (!row.estado) {
      throw new Error("Product status is required.");
    }
  }
}
