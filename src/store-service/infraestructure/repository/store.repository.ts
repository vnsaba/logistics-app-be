import { Store } from "src/store-service/domain/entity/store";
import { IUStoreRepository } from "../../domain/interface/store.interface";
import { prismaMysql } from "../../../../prisma/index";

export class StoreRepository implements IUStoreRepository {

    async findById(id: number): Promise<Store> {
        return await prismaMysql.store.findUnique({
            where: { id: Number(id) },
        }).then((store) => {
            if (!store) {
                throw new Error(`Store with id ${id} not found`);
            }
            return store;
        })

    }


}