export type GestionTaskCategory =
  | "planificacion"
  | "invitados"
  | "programa"
  | "logistica"
  | "presupuesto"
  | "proveedores"
  | "ceremonia"
  | "otros";

export type GestionTaskPhase =
  | "pre_apertura"
  | "apertura"
  | "post_apertura"
  | "recta_final";

export type GestionTaskPriority = "alta" | "media" | "baja";

export type GestionRelatedModule =
  | "invitados"
  | "mesas"
  | "ceremonia"
  | "programa"
  | "alojamientos"
  | "desplazamientos"
  | "presupuesto"
  | "actividad"
  | "ajustes"
  | "musica"
  | "chat"
  | "archivos";

export interface GestionTask {
  id: string;
  title: string;
  category: GestionTaskCategory;
  phase: GestionTaskPhase;
  priority: GestionTaskPriority;
  dueDate?: string;
  completed: boolean;
  completedAt?: number;
  notes?: string;
  relatedModule?: GestionRelatedModule;
  source: "template" | "manual";
  order: number;
}

export interface GestionDocument {
  guestOpeningDate?: string;
  tasks: GestionTask[];
  updatedAt: number;
}
