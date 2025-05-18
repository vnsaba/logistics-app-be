export class Category {
  id?: number;

  constructor(
    public name: string,
    public description: string,
    id?: number
  ) {
    this.validate();
    if (id) this.id = id;
  }

  private validate(): void {
    if (!this.name.trim() || this.name.length < 3 || this.name.length > 100) {
      throw new Error("Category name must be between 3 and 100 characters.");
    }

    if (!this.description.trim() || this.description.length < 10 || this.description.length > 500) {
      throw new Error("Category description must be between 10 and 500 characters.");
    }
  }

  static createFrom(data: Partial<Category> & { id?: number }): Category {
    return new Category(data.name!, data.description!, data.id);
  }
}
