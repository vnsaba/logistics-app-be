import { IProductRepository } from "../domain/interfaces/product.interface";
import { Product } from "../domain/entity/product";
import { CreateProductDto } from "../infraestructure/dto/create-product.dto";
import { UpdateProductDto } from "../infraestructure/dto/update-product.dto";

export class ProductService {
  constructor(private readonly productRepository: IProductRepository) {}

  async create(productData: CreateProductDto): Promise<Product> {
    const product = Product.createFrom(productData);

    const existing = await this.productRepository.findByBarcode(
      product.barCode
    );
    if (existing) {
      throw new Error(
        `Product with barCode ${product.barCode} already exists.`
      );
    }

    return await this.productRepository.create(product);
  }

  async getAll(): Promise<Product[]> {
    return await this.productRepository.findAll();
  }

  async getById(id: number): Promise<Product | null> {
    return await this.productRepository.findById(id);
  }

  async update(id: number, productData: UpdateProductDto): Promise<Product> {
    const updatePayload = {
      ...productData,
      ...(productData.dateOfExpiration && {
        dateOfExpiration: new Date(productData.dateOfExpiration),
      }),
    };

    return await this.productRepository.update(id, updatePayload);
  }

  async delete(id: number): Promise<void> {
    await this.productRepository.delete(id);
  }
}
