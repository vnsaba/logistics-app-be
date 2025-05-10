import { Store } from "../entity/store";

export interface IUStoreRepository {
    // create(store: Store): Promise<Store>;
    findById(id: number): Promise<Store>;
    // findAll(): Promise<Store[]>;
    // update(id: string, store: Store): Promise<Store>;
    // delete(id: string): Promise<void>;
    // findByName(name: string): Promise<Store | null>;
}