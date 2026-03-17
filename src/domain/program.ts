export type WeddingProgramCategory =
  | "general"
  | "recepcion"
  | "ceremonia"
  | "cocktail"
  | "banquete"
  | "baile"
  | "fiesta"
  | "traslado";

export type WeddingProgramItem = {
  id: string;
  hora: string;
  titulo: string;
  subtitulo: string;
  descripcion?: string;
  ubicacion?: string;
  visible: boolean;
  orden: number;
  categoria: WeddingProgramCategory;
};

export type WeddingProgramConfig = {
  tituloSeccion: string;
  subtituloSeccion: string;
};

export type WeddingProgramDocument = {
  config: WeddingProgramConfig;
  items: WeddingProgramItem[];
};
