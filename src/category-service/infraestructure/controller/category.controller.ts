import { Route, Controller, Post, Get, Put, Delete, Path, Body, Tags } from 'tsoa';
import { CategoryService } from '../../application/category.service';
import { CategoryRepository } from '../repository/category.repository';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Category } from '../../domain/entity/category';

@Route('categories')
@Tags('Category')
export class CategoryController extends Controller {
  private readonly categoryService: CategoryService;

  constructor() {
    super();
    const categoryRepository = new CategoryRepository();
    this.categoryService = new CategoryService(categoryRepository);
  }

  @Post()
  public async createCategory(@Body() body: CreateCategoryDto) {
    return await this.categoryService.create(body);
  }

  @Get()
  public async getAllCategories(): Promise<Category[]> {
    return await this.categoryService.getAll();
  }

  @Get('{id}')
  public async getCategoryById(@Path() id: number): Promise<Category | null> {
    return await this.categoryService.getById(id);
  }

  @Put('{id}')
  public async updateCategory(@Path() id: number, @Body() body: UpdateCategoryDto): Promise<Category> {
    return await this.categoryService.update(id, body);
  }

  @Delete('{id}')
  public async deleteCategory(@Path() id: number): Promise<void> {
    await this.categoryService.delete(id);
  }
}
