// Decrypts a PokeRogue session export to JSON, with the save key and crypto-js of the local game checkout, and prints
// the wave and both parties.

import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { parseArgs } from "node:util";
import { defaultGameRoot, newestSessionExport, projectRoot } from "./session-export.ts";

const { values: commandLineOptions } = parseArgs({
  options: {
    /** Session export to decrypt; defaults to the newest `*sessionData*.prsv` at the project root. */
    save: { type: "string" },
    /** PokeRogue checkout that provides the save key and crypto-js. */
    game: { type: "string", default: defaultGameRoot },
    /** Where the decrypted session is written. */
    out: { type: "string", default: path.join(projectRoot, "session.json") },
  },
});

interface CryptoJs {
  AES: { decrypt(ciphertext: string, key: string): { toString(encoding: unknown): string } };
  enc: { Utf8: unknown };
}

interface SessionPokemon {
  species: number;
  level: number;
  shiny: boolean;
  boss: boolean;
}

interface Session {
  waveIndex: number;
  timestamp: number;
  party: SessionPokemon[];
  enemyParty: SessionPokemon[];
}

/** Names by value from a TypeScript enum source file, whose members count up from the last explicit value. */
function readEnumNames(filePath: string): Map<number, string> {
  const names = new Map<number, string>();
  let nextValue = 0;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const member = /^\s+([A-Z0-9_]+)(?: = (\d+))?,?$/.exec(line);
    if (member?.[1]) {
      const value = member[2] === undefined ? nextValue : Number(member[2]);
      names.set(value, member[1]);
      nextValue = value + 1;
    }
  }
  return names;
}

const gameRoot = path.resolve(commandLineOptions.game);
const savePath = path.resolve(commandLineOptions.save ?? newestSessionExport());
const outPath = path.resolve(commandLineOptions.out);

const constantsSource = fs.readFileSync(path.join(gameRoot, "src/constants.ts"), "utf8");
const saveKey = /export const saveKey = "([^"]+)"/.exec(constantsSource)?.[1];
if (!saveKey) {
  throw new Error(`No saveKey in ${path.join(gameRoot, "src/constants.ts")}`);
}
const cryptoJs = createRequire(path.join(gameRoot, "package.json"))("crypto-js") as CryptoJs;
const sessionJson = cryptoJs.AES.decrypt(fs.readFileSync(savePath, "utf8"), saveKey).toString(cryptoJs.enc.Utf8);
const session = JSON.parse(sessionJson) as Session;
fs.writeFileSync(outPath, JSON.stringify(session, null, 2));

const speciesNames = readEnumNames(path.join(gameRoot, "src/enums/species-id.ts"));
const describePokemon = (pokemon: SessionPokemon) =>
  `${speciesNames.get(pokemon.species) ?? pokemon.species} Lv.${pokemon.level}`
  + (pokemon.shiny ? " shiny" : "")
  + (pokemon.boss ? " boss" : "");

console.log(`${savePath}\n  -> ${outPath}`);
console.log(`wave ${session.waveIndex}, saved ${new Date(session.timestamp).toISOString()}`);
console.log(`party: ${session.party.map(describePokemon).join(", ")}`);
console.log(`enemies: ${session.enemyParty.map(describePokemon).join(", ")}`);
