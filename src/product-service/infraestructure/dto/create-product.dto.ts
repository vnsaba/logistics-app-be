export interface CreateProductDto {
  id_producto: string;
  id_proveedor: string;
  name: string;
  description: string;
  categoryId: number;
  unitPrice: number;
  weight: number;
  isFragile: boolean;
  dimensionsCm: string;
  imageUrl: string;
  barCode: string;
  requiredRefrigeration: boolean;
  dateOfExpiration: Date; 
  status?: "ACTIVE" | "INACTIVE";
}
