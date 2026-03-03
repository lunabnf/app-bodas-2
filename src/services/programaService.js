import { weddingProgramSchema } from "../domain/schemas";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
const PROGRAM_KEY = "wedding.programa";
export function getWeddingProgram() {
    return readStorageWithSchema(PROGRAM_KEY, weddingProgramSchema, []);
}
export function saveWeddingProgram(events) {
    writeStorage(PROGRAM_KEY, events);
}
