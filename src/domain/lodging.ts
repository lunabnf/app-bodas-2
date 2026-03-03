export interface LodgingOption {
  id: string;
  nombre: string;
  direccion: string;
  link: string;
  notas?: string;
}

export interface LodgingRequest {
  id: string;
  guestToken: string;
  guestName: string;
  lodgingId: string | null;
  needsLodging: boolean;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
