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
export const invitationRoleSchema = z.enum(["titular", "acompanante"]);
export const personStatusSchema = z.enum(["creada", "confirmada", "cancelada", "incompleta"]);
export const guestAccessStateSchema = z.enum([
  "no_permitido",
  "permitido",
  "codigo_disponible",
  "activado",
  "bloqueado",
]);
export const assignmentStateSchema = z.enum(["sin_asignar", "asignada"]);
export const menuStateSchema = z.enum(["sin_definir", "adulto", "infantil", "especial"]);
export const ceremonySeatSideSchema = z.enum(["left", "right"]);
export const ceremonySeatAssignmentSchema = z.object({
  side: ceremonySeatSideSchema,
  row: z.number().int().positive(),
  seat: z.number().int().positive(),
});

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
  invitationToken: z.string().optional(),
  invitationRole: invitationRoleSchema.optional(),
  personaEstado: personStatusSchema.optional(),
  accessState: guestAccessStateSchema.optional(),
  assignmentState: assignmentStateSchema.optional(),
  menuEstado: menuStateSchema.optional(),
  alergias: z.array(z.string()).optional(),
  intolerancias: z.string().optional(),
  notaPrivada: z.string().optional(),
  ceremonySeat: ceremonySeatAssignmentSchema.optional(),
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
  tipoMesa: z.enum(["redonda", "rectangular"]),
  capacidad: z.number(),
  orden: z.number().int().nonnegative(),
  templateCategory: z
    .enum([
      "fiesta",
      "naturaleza",
      "musica_pop",
      "musica_rock",
      "ciudades",
      "peliculas",
      "romantico",
      "personalizado",
    ]),
  collapsed: z.boolean(),
  invitadosTokens: z.array(z.string()),
  captainToken: z.string().nullable(),
});

export const lodgingTypeSchema = z.enum(["hotel", "hostal", "apartamento", "casa_rural", "otro"]);

export const lodgingOptionSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  tipo: lodgingTypeSchema.optional(),
  descripcion: z.string().optional(),
  direccion: z.string(),
  municipio: z.string().optional(),
  distanciaKm: z.number().nonnegative().optional(),
  telefono: z.string().optional(),
  email: z.string().optional(),
  webUrl: z.string().optional(),
  bookingUrl: z.string().optional(),
  precioDesde: z.number().nonnegative().optional(),
  images: z.array(z.string()).optional(),
  visible: z.boolean().optional(),
  destacado: z.boolean().optional(),
  sourceUrl: z.string().optional(),
  notas: z.string().optional(),
  notasPrivadas: z.string().optional(),
  link: z.string().optional(),
});

export const lodgingRequestSchema = z.object({
  id: z.string(),
  guestToken: z.string(),
  guestName: z.string(),
  accommodationId: z.string().nullable().optional(),
  lodgingId: z.string().nullable().optional(),
  interested: z.boolean().optional(),
  needsLodging: z.boolean(),
  persons: z.number().int().positive().optional(),
  comment: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const transportTypeSchema = z.enum([
  "bus",
  "microbus",
  "transfer",
  "coche_compartido",
  "otro",
]);
export const transportTripStateSchema = z.enum(["borrador", "activo", "completo", "cancelado"]);
export const tripDirectionSchema = z.enum(["ida", "vuelta", "ambas"]);
export const guestTransportStateSchema = z.enum([
  "pendiente",
  "solicitado",
  "asignado",
  "resuelto",
  "sin_solucion",
]);
export const transportNoticeTypeSchema = z.enum(["info", "importante", "urgente"]);

export const transportOptionSchema = z.object({
  id: z.string(),
  titulo: z.string().optional(),
  nombre: z.string(),
  origen: z.string(),
  destino: z.string(),
  fecha: z.string().optional(),
  horaSalida: z.string().optional(),
  horaLlegadaEstimada: z.string().optional(),
  hora: z.string(),
  tipoTransporte: transportTypeSchema.optional(),
  plazasDisponibles: z.number().optional(),
  plazasOcupadas: z.number().optional(),
  capacidad: z.number(),
  requiereReserva: z.boolean().optional(),
  precioOpcional: z.number().optional(),
  puntoEncuentro: z.string().optional(),
  responsable: z.string().optional(),
  contacto: z.string().optional(),
  observaciones: z.string().optional(),
  notas: z.string(),
  estado: transportTripStateSchema.optional(),
});

export const transportRequestSchema = z.object({
  id: z.string(),
  guestToken: z.string(),
  guestName: z.string(),
  transportId: z.string(),
  seats: z.number(),
  notes: z.string().optional(),
  needsTransport: z.boolean().optional(),
  direction: tripDirectionSchema.optional(),
  origin: z.string().optional(),
  peopleCount: z.number().int().positive().optional(),
  reducedMobility: z.boolean().optional(),
  childSeat: z.boolean().optional(),
  comments: z.string().optional(),
  status: guestTransportStateSchema.optional(),
  assignedTripId: z.string().optional(),
  hasCarOffer: z.boolean().optional(),
  offeredSeats: z.number().int().nonnegative().optional(),
  approximateSchedule: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const transportNoticeSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  mensaje: z.string(),
  tipo: transportNoticeTypeSchema,
  fechaHora: z.string(),
  trayectoRelacionado: z.string().optional(),
});

export const songProposalSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  url: z.string().optional(),
  proposerGuestToken: z.string(),
  visible: z.boolean(),
  createdAt: z.number(),
  legacyVotesBase: z.number().int().nonnegative().optional(),
});

export const songVoteSchema = z.object({
  id: z.string(),
  proposalId: z.string(),
  guestToken: z.string(),
  createdAt: z.number(),
});

export const rsvpAttendanceSchema = z.enum(["", "si", "no"]);

export const rsvpPersonDetailSchema = z.object({
  nombre: z.string(),
  edad: z.number().optional(),
  alergias: z.array(z.string()),
  intolerancias: z.string().optional(),
  tipo: guestTypeSchema.optional(),
  guestToken: z.string().optional(),
  accessEnabled: z.boolean().optional(),
});

export const guestRsvpSchema = z.object({
  guestToken: z.string(),
  guestName: z.string(),
  attending: rsvpAttendanceSchema,
  adultos: z.number(),
  ninos: z.number(),
  detalles: z.array(rsvpPersonDetailSchema),
  nota: z.string().optional(),
  invitationToken: z.string().optional(),
  invitationStatus: z
    .enum(["pendiente", "respondida", "confirmada", "rechazada", "modificada"])
    .optional(),
  rejectionReason: z.string().optional(),
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
  subtitulo: z.string().optional(),
  descripcion: z.string().optional(),
  ubicacion: z.string().optional(),
  visible: z.boolean().optional(),
  orden: z.number().int().nonnegative().optional(),
  categoria: z
    .enum(["general", "recepcion", "ceremonia", "cocktail", "banquete", "baile", "fiesta", "traslado"])
    .optional(),
});

export const weddingProgramSchema = z.array(weddingProgramEventSchema);

export const weddingProgramConfigSchema = z.object({
  tituloSeccion: z.string(),
  subtituloSeccion: z.string(),
});

export const weddingProgramDocumentSchema = z.object({
  config: weddingProgramConfigSchema,
  items: weddingProgramSchema,
});

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
  mesasVisibilityMode: z.enum(["hidden", "visible", "scheduled"]).optional(),
  mesasPublishAt: z.string().nullable().optional(),
});

export const ceremonyLayoutTypeSchema = z.enum(["two_blocks_center_aisle"]);

export const ceremonyLayoutSchema = z.object({
  layoutType: ceremonyLayoutTypeSchema,
  leftRows: z.number().int().positive(),
  rightRows: z.number().int().positive(),
  seatsPerRow: z.number().int().positive(),
  centerAisleLabel: z.string().optional(),
  updatedAt: z.number(),
});
