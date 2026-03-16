export interface Table {
  id: string;
  nombre: string;
  tipoMesa: "redonda" | "rectangular";
  capacidad: number;
  orden: number;
  templateCategory: "fiesta" | "naturaleza" | "musica_pop" | "musica_rock" | "ciudades" | "peliculas" | "romantico" | "personalizado";
  collapsed: boolean;
  invitadosTokens: string[];
  captainToken?: string | null;
}
