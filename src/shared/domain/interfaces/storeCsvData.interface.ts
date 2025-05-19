// shared/domain/interfaces/storeCsvData.interface.ts
export interface StoreCsvData {
  id_almacen: string;
  nombre_almacen: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  pais: string; // Este campo no se utilizará, ya que lo estamos ignorando
  codigo_postal: number;
  latitud: number;
  longitud: number;
  gerente: string;
  telefono: string;
  email: string;
  capacidad_m2: number;
  estado: string;
}
