import { z } from "zod";
import { readStorageWithSchema } from "../lib/storage";

const currentUserSchema = z.object({
  nombre: z.string(),
  email: z.string().optional(),
  role: z.string().optional(),
  token: z.string().optional(),
  mesa: z.string().optional(),
  esAdulto: z.boolean().optional(),
  edad: z.number().optional(),
  grupoTipo: z.string().optional(),
  tipo: z.string().optional(),
});

export type CurrentUser = z.infer<typeof currentUserSchema>;

export function getUsuarioActual(): CurrentUser | null {
  return readStorageWithSchema<CurrentUser | null>(
    "wedding.user",
    currentUserSchema.nullable(),
    null
  );
}
