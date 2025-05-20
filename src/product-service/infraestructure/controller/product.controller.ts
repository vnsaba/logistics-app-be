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
} from "tsoa";

import { Product } from "../../domain/entity/product";
import { ProductService } from "../../application/product.service";
import { ProductRepository } from "../repository/product.repository";
import { CreateProductDto } from "../dto/create-product.dto";
import { UpdateProductDto } from "../dto/update-product.dto";

@Route("products")
@Tags("Products")
export class ProductController extends Controller {
  private readonly productService: ProductService;

  constructor() {
    super();
    const repository = new ProductRepository();
    this.productService = new ProductService(repository);
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
}
