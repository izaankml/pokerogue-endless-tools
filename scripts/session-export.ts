import fs from "node:fs";
import path from "node:path";

/** The root of this project, where session exports go. */
export const projectRoot = path.resolve(import.meta.dirname, "..");

/** The local PokeRogue checkout, whose source and test harness the tools use. */
export const defaultGameRoot = path.resolve(projectRoot, "../pokerogue/beta");

/** The newest `*sessionData*.prsv` export at the project root. */
export function newestSessionExport(): string {
  const exports = fs
    .readdirSync(projectRoot)
    .filter(fileName => fileName.endsWith(".prsv") && fileName.includes("sessionData"))
    .map(fileName => path.join(projectRoot, fileName))
    .sort((left, right) => fs.statSync(right).mtimeMs - fs.statSync(left).mtimeMs);
  if (!exports[0]) {
    throw new Error(`No *sessionData*.prsv export at ${projectRoot}; pass --save`);
  }
  return exports[0];
}
