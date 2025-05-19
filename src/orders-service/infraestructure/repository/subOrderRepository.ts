
export interface SubOrderInterface {
    //buscar las ordenes asoaaciadas a la orden
    findByIdWithItems(id: number): Promise<SubOrderInterface | null>;
    
}