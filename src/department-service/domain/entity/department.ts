export class Department {
  public id?: number;
  public name: string;

  constructor(data: { name: string; id?: number }) {
    this.name = data.name;
    this.id = data.id;
  }

  static createFrom(data: { id: number; name: string }): Department {
    return new Department({ name: data.name, id: data.id });
  }
}
