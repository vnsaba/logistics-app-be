export class Department {
  constructor(public id: number, public name: string) {}

  static createFrom(data: { id: number; name: string }): Department {
    return new Department(data.id, data.name);
  }
}
