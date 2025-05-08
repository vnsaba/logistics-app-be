import { Store } from '../entity/store';

export interface IStoreRepository {
  findById(id: number): Promise<Store | null>;
  create(store: Store): Promise<Store>;
}
