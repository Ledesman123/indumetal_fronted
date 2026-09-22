export interface KardexItem {
  fecha: string;
  tipo: string;
  ubicacion: string;
  entrada: number;
  salida: number;
  saldo: number;
  referencia?: string;
  usuario: string;
}