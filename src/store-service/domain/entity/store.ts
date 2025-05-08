export class Store {
  id?: string;

  constructor(
    public name: string,
    public address: string,
    public city_id: string,
    public capacity: number,
    public latitude: number,
    public longitude: number,
    public zip_code: string,
    public status: string,
    id?: string
  ) {
    // Validate field
    if (
      !name.trim() ||
      !address.trim() ||
      !city_id.trim() ||
      !capacity ||
      !latitude ||
      !longitude ||
      !zip_code.trim() ||
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
