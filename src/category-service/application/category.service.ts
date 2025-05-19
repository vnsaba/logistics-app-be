import { ICategoryRepository } from '../domain/interfaces/category.interface';
import { Category } from '../domain/entity/category';
import { CreateCategoryDto } from '../infraestructure/dto/create-category.dto';
import { UpdateCategoryDto } from '../infraestructure/dto/update-category.dto';

export class CategoryService {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async create(categoryData: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryRepository.findByName(categoryData.name);
    if (existingCategory) {
      throw new Error('Category with this name already exists.');
    }

    const category = Category.createFrom(categoryData);
    return await this.categoryRepository.create(category);
  }

  async getAll(): Promise<Category[]> {
    return await this.categoryRepository.findAll();
  }

  async getById(id: number): Promise<Category | null> {
    return await this.categoryRepository.findById(id);
  }

  async update(id: number, categoryData: UpdateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) {
      throw new Error('Category not found.');
    }

    if (categoryData.name) {
      const existingWithName = await this.categoryRepository.findByName(categoryData.name);
      if (existingWithName && existingWithName.id !== id) {
        throw new Error('Category with this name already exists.');
      }
    }

    const updatedCategory = Category.createFrom({
      ...existingCategory,
      ...categoryData,
    });

    return await this.categoryRepository.update(id, updatedCategory);
  }

  async delete(id: number): Promise<void> {
    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) {
      throw new Error('Category not found.');
    }

    await this.categoryRepository.delete(id);
  }
}
