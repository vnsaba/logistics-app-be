import { City } from "../entity/city";

export interface ICityRepository {
    findById(id: number): Promise<City | null>;
}