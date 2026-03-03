export interface TransportOption {
  id: string;
  nombre: string;
  origen: string;
  destino: string;
  hora: string;
  capacidad: number;
  notas: string;
}

export interface TransportRequest {
  id: string;
  guestToken: string;
  guestName: string;
  transportId: string;
  seats: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
