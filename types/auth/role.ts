export enum UserRole {
  ADMINISTRADOR = 'ADMINISTRADOR',
  GERENTE = 'GERENTE',
  DESPACHADOR = 'DESPACHADOR',
  REPARTIDOR = 'REPARTIDOR',
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}
