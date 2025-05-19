export class City {
  constructor(public id: number, public name: string, public departmentId: number) {}

  static createFrom(data: { id: number; name: string; departmentId: number }): City {
    return new City(data.id, data.name, data.departmentId);
  }
}
