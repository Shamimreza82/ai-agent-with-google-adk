# AGENTS.md

Minimal Google ADK (TypeScript) playground: a single agent in `agent.ts` exporting `rootAgent` (an `LlmAgent` with the `GOOGLE_SEARCH` tool, model `gemini-flash-latest`).

## Commands

The `adk` CLI is provided by the `@google/adk-devtools` devDependency (verified `adk --version` → `2.4.0`). Use `npx adk ...` or `node_modules/.bin/adk`.

- `npx adk run agent.ts` — interactive terminal chat. Accepts `.ts` directly; the loader compiles/bundles it with esbuild.
- `npx adk web` — dev UI + API at `http://localhost:8000`. With no argument it uses the repo root as `agents_dir`; top-level `*.ts`/`*.js` files become agents named after the file (`agent.ts` → `agent`), and each subdirectory becomes an agent only if it contains `agent.ts` or `app.ts`.
- `npx adk api_server` — same discovery, REST API only.
- `npx adk create <name> --language ts` — scaffold a new agent.
- `npx adk <cmd> --help` — flags such as `--port`, `--reload_agents`, `--session_service_uri memory://`.

There are no npm scripts, tests, lint, typecheck, or CI configured. Do not invent `npm test` / `npm run build` commands.

## Setup and gotchas

- `.env` at the repo root exists but is empty and is auto-loaded (the CLI walks up from the agent file). Set either:
  - Gemini API: `GOOGLE_API_KEY` (or `GEMINI_API_KEY` / `GOOGLE_GENAI_API_KEY`)
  - Vertex AI: `GOOGLE_GENAI_USE_VERTEXAI=true` + `GOOGLE_CLOUD_PROJECT` + `GOOGLE_CLOUD_LOCATION`

  Missing credentials fail at model-call time, not at startup.
- The repo path contains spaces (`ai-agent -with-google adk`); quote paths in shell commands.
- Agent files must export a `rootAgent` that is an ADK `BaseAgent`/`Workflow` instance; the loader errors if none is found.
- `package.json` has no `"type": "module"` and there is no `tsconfig.json` or local `typescript`. The ADK loader infers module type and compiles TS itself, so keep ESM-style imports and do not add a separate build step.
- Agent discovery skips `node_modules` and dotfiles, so keep agents as top-level files/directories.
