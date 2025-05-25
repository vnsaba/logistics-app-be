export interface ICityRepository {
    findById(id: number): Promise<any>;
}