export type LodgingType = "hotel" | "hostal" | "apartamento" | "casa_rural" | "otro";

export interface LodgingOption {
  id: string;
  nombre: string;
  tipo: LodgingType;
  descripcion: string;
  direccion: string;
  municipio: string;
  distanciaKm?: number;
  telefono: string;
  email: string;
  webUrl: string;
  bookingUrl: string;
  precioDesde?: number;
  images: string[];
  visible: boolean;
  destacado: boolean;
  sourceUrl?: string;
  notas?: string;
  notasPrivadas?: string;
  link?: string;
}

export interface LodgingRequest {
  id: string;
  guestToken: string;
  guestName: string;
  accommodationId: string | null;
  lodgingId?: string | null;
  interested: boolean;
  needsLodging: boolean;
  persons?: number;
  comment?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
