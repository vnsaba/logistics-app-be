export interface ProductCsvData {
  id_producto: string;
  id_almacen: string;
  nombre_producto: string;
  categoria: string;
  descripcion: string;
  sku: string;
  codigo_barras: string;
  precio_unitario: number;
  cantidad_stock: number;
  nivel_reorden: number;
  ultima_reposicion: string;
  fecha_vencimiento: string;
  id_proveedor: string;
  peso_kg: number;
  dimensiones_cm: string;
  es_fragil: "true" | "false";
  requiere_refrigeracion: "true" | "false";
  estado: "activo" | "inactivo";
}
