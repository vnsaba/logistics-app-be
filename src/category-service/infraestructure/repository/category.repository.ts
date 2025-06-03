import { prismaMysql } from "../../../../prisma/index";
import { Category } from '../../domain/entity/category';
import { ICategoryRepository } from '../../domain/interfaces/category.interface';

export class CategoryRepository implements ICategoryRepository {
  async findById(id: number): Promise<Category | null> {
    const category = await prismaMysql.category.findUnique({ where: { id } });
    return category ? Category.createFrom(category) : null;
  }

  async findByName(name: string): Promise<Category | null> {
    const category = await prismaMysql.category.findUnique({ where: { name } });
    return category ? Category.createFrom(category) : null;
  }

  async create(category: Category): Promise<Category> {
    const created = await prismaMysql.category.create({
      data: {
        name: category.name,
        description: category.description,
        isActive: category.isActive,
      },
    });
    return Category.createFrom(created);
  }

  async update(id: number, data: Partial<Category>): Promise<Category> {
    const updated = await prismaMysql.category.update({
      where: { id },
      data,
    });
    return Category.createFrom(updated);
  }

  async delete(id: number): Promise<void> {
    await prismaMysql.category.delete({ where: { id } });
  }

  async findAll(): Promise<Category[]> {
    const categories = await prismaMysql.category.findMany();
    return categories.map((category) => Category.createFrom(category));
  }
}
