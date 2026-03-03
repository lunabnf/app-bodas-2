import type { z } from "zod";
import { weddingProgramEventSchema, weddingProgramSchema } from "../domain/schemas";
import { readStorageWithSchema, writeStorage } from "../lib/storage";

const PROGRAM_KEY = "wedding.programa";

export type WeddingProgramEvent = z.infer<typeof weddingProgramEventSchema>;

export function getWeddingProgram(): WeddingProgramEvent[] {
  return readStorageWithSchema(PROGRAM_KEY, weddingProgramSchema, []);
}

export function saveWeddingProgram(events: WeddingProgramEvent[]) {
  writeStorage(PROGRAM_KEY, events);
}
