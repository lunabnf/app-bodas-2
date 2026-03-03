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
export function getUsuarioActual() {
    return readStorageWithSchema("wedding.user", currentUserSchema.nullable(), null);
}
