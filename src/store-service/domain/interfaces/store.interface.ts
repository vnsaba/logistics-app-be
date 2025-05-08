import { Store } from '../entity/store';

export interface IStoreRepository {
  findById(id: string): Promise<Store | null>;
  create(store: Store): Promise<Store>;
}
