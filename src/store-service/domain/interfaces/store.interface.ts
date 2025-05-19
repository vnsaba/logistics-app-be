import { Store } from '../entity/store';

export interface IStoreRepository {
  findById(id: number): Promise<Store | null>;
  create(store: Store): Promise<Store>;
  findByName(name: string): Promise<Store | null>;
  update(id: number, data: Partial<Store>): Promise<Store>;
  delete(id: number): Promise<void>;
  findAll(): Promise<Store[]>;

}
