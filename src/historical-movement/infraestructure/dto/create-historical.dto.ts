export interface CreateHistoricalMovementDto {
  inventoryId: number;   
  userId: string;        
  reason: string;        
  movementType: "IN" | "OUT" | "ADJUSTMENT";  
}
