# PokeRogue Endless Tools

Tools for PokeRogue Endless runs that work from an export of the run's session.

## Setup

```sh
pnpm install
```

The tools also need a PokeRogue checkout at `../pokerogue/beta` (or `--game <path>`) with its dependencies installed, on the same game version as the live game. They read the save key and game data from it, and the battle search runs in its test harness.

Export the session from the game's Manage Data menu and put the `.prsv` file at the root of this project. Each tool uses the newest `*sessionData*.prsv` here unless you pass `--save <path>`. Exports, decrypted sessions and search output are gitignored.

## Tools

- `pnpm decrypt-session` writes the decrypted session to `session.json` and prints the wave and both parties. `--out <path>` writes it elsewhere.
- `pnpm battle-search` finds commands that faint one enemy of a double battle and leave the other alive to catch, such as a shiny next to a dangerous partner. See [scripts/battle-search/README.md](scripts/battle-search/README.md).
- `pnpm typecheck` checks the scripts. The battle search's `game/` folder compiles only inside the game repo, so it is left out.
