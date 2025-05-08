export class Store {
  id?: number;

  constructor(
    public name: string,
    public address: string,
    public cityId: number,
    public capacity: number,
    public latitude: number,
    public longitude: number,
    public zipCode: string,
    public status: string,
    id?: number
  ) {
    // Validate field
    if (
      !name.trim() ||
      !address.trim() ||
      !cityId ||
      !capacity ||
      !latitude ||
      !longitude ||
      !zipCode.trim() ||
      !status.trim()
    ) {
      throw new Error(
        'All fields are required: name, address, city_id, capacity, latitude, longitude, zip_code and status'
      );
    }

    if (id) {
      this.id = id;
    }
  }
}
