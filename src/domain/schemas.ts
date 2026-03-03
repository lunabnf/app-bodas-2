import { z } from "zod";

export const guestGroupTypeSchema = z.enum([
  "familia_novia",
  "familia_novio",
  "amigos_novia",
  "amigos_novio",
  "amigos_comunes",
  "amigos_trabajo",
  "amigos_pueblo",
  "proveedores",
  "otros",
]);

export const guestStatusSchema = z.enum(["confirmado", "pendiente", "rechazado"]);
export const guestTypeSchema = z.enum(["Adulto", "Niño"]);

export const guestSchema = z.object({
  id: z.string(),
  token: z.string(),
  nombre: z.string(),
  tipo: guestTypeSchema,
  grupo: z.string(),
  grupoTipo: guestGroupTypeSchema,
  estado: guestStatusSchema,
  mesa: z.string().optional(),
  esAdulto: z.boolean().optional(),
  edad: z.number().int().nonnegative().optional(),
});

export const guestSessionSchema = z.object({
  token: z.string(),
  nombre: z.string(),
  mesa: z.string().optional(),
  esAdulto: z.boolean().optional(),
  edad: z.number().int().nonnegative().optional(),
  grupoTipo: guestGroupTypeSchema,
  tipo: guestTypeSchema,
});

export const tableSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  capacidad: z.number(),
  invitadosTokens: z.array(z.string()),
  captainToken: z.string().nullable(),
});

export const lodgingOptionSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  direccion: z.string(),
  link: z.string(),
  notas: z.string().optional(),
});

export const lodgingRequestSchema = z.object({
  id: z.string(),
  guestToken: z.string(),
  guestName: z.string(),
  lodgingId: z.string().nullable(),
  needsLodging: z.boolean(),
  notes: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const transportOptionSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  origen: z.string(),
  destino: z.string(),
  hora: z.string(),
  capacidad: z.number(),
  notas: z.string(),
});

export const transportRequestSchema = z.object({
  id: z.string(),
  guestToken: z.string(),
  guestName: z.string(),
  transportId: z.string(),
  seats: z.number(),
  notes: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const rsvpAttendanceSchema = z.enum(["", "si", "no"]);

export const rsvpPersonDetailSchema = z.object({
  nombre: z.string(),
  edad: z.number().optional(),
  alergias: z.array(z.string()),
  intolerancias: z.string().optional(),
});

export const guestRsvpSchema = z.object({
  guestToken: z.string(),
  guestName: z.string(),
  attending: rsvpAttendanceSchema,
  adultos: z.number(),
  ninos: z.number(),
  detalles: z.array(rsvpPersonDetailSchema),
  nota: z.string().optional(),
  timestamp: z.number(),
});

export const logItemSchema = z.object({
  id: z.string(),
  user: z.string(),
  action: z.string(),
  timestamp: z.number(),
});

export const activityEventSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  tipo: z.string(),
  mensaje: z.string(),
  tokenInvitado: z.string().optional(),
});

export const chatAudienceSchema = z.enum(["all", "adults", "children", "groups", "age_range"]);

export const chatRoomSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  audience: chatAudienceSchema,
  allowedGroups: z.array(guestGroupTypeSchema).optional(),
  minAge: z.number().optional(),
  maxAge: z.number().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const chatMessageSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  authorType: z.enum(["admin", "guest"]),
  authorName: z.string(),
  authorToken: z.string().optional(),
  body: z.string(),
  createdAt: z.number(),
});

export const appearanceSettingsSchema = z.object({
  heroTitleMaxRem: z.number(),
  pageTitleRem: z.number(),
  sectionTitleRem: z.number(),
  surfaceOpacity: z.number(),
  softSurfaceOpacity: z.number(),
});

export const weddingProgramEventSchema = z.object({
  id: z.string(),
  hora: z.string(),
  titulo: z.string(),
  descripcion: z.string(),
});

export const weddingProgramSchema = z.array(weddingProgramEventSchema);

export const weddingSettingsSchema = z.object({
  novio: z.string(),
  novia: z.string(),
  fecha: z.string(),
  hora: z.string(),
  ubicacion: z.string(),
  color: z.string(),
  mensajeInvitacion: z.string(),
  portada: z.string().nullable(),
  mostrarPrograma: z.boolean(),
  mostrarMesas: z.boolean(),
});
