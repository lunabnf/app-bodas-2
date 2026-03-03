export interface Table {
  id: string;
  nombre: string;
  capacidad: number;
  invitadosTokens: string[];
  captainToken?: string | null;
}
