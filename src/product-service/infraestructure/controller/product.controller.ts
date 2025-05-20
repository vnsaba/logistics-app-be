import {
  Controller,
  Route,
  Tags,
  Post,
  Get,
  Delete,
  Body,
  Path,
  Patch,
  UploadedFile,
} from "tsoa";

import { Product } from "../../domain/entity/product";
import { ProductService } from "../../application/product.service";
import { ProductRepository } from "../repository/product.repository";
import { CreateProductDto } from "../dto/create-product.dto";
import { UpdateProductDto } from "../dto/update-product.dto";
import { UploadProductService } from "../../application/uploadProduct.service";
import { InventoryRepository } from "../../../inventory-service/infraestructure/repository/inventory.repository";
import { MulterFileReader } from "../../../shared/infraestructure/multerFileReader";

@Route("products")
@Tags("Products")
export class ProductController extends Controller {
  private readonly productService: ProductService;
  private readonly uploadProductService: UploadProductService;

  constructor() {
    super();
    const inventoryRepository = new InventoryRepository();
    const productRepository = new ProductRepository();
    this.productService = new ProductService(productRepository);
    const multerFileReader = new MulterFileReader();

    this.uploadProductService = new UploadProductService(
      productRepository,
      inventoryRepository,
      multerFileReader
    );
  }

  @Post()
  public async createProduct(@Body() body: CreateProductDto): Promise<Product> {
    return await this.productService.create({
      ...body,
      dateOfExpiration: new Date(body.dateOfExpiration),
    });
  }

  @Get()
  public async getAllProducts(): Promise<Product[]> {
    return await this.productService.getAll();
  }

  @Get("{id}")
  public async getProductById(@Path() id: number): Promise<Product | null> {
    return await this.productService.getById(id);
  }

  @Patch("{id}")
  public async updateProduct(
    @Path() id: number,
    @Body() body: UpdateProductDto
  ): Promise<Product> {
    return await this.productService.update(id, {
      ...body,
      dateOfExpiration: body.dateOfExpiration
        ? new Date(body.dateOfExpiration)
        : undefined,
    });
  }

  @Delete("{id}")
  public async deleteProduct(@Path() id: number): Promise<void> {
    await this.productService.delete(id);
  }

  @Post("upload")
  public async loadStores(@UploadedFile() file: Express.Multer.File) {
    return await this.uploadProductService.upload<
      Express.Multer.File,
      { id: string; last_name: string; phone: string; isbn: string }
    >({
      file,
      separator: ";",
    });
  }
}
