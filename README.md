# Journey builder test (Avantos prefill challenge)

React + TypeScript + Vite UI that loads an **action blueprint graph**, lists **forms**, and edits **per-field prefill mappings** with an extensible **data source registry**.

## Run locally

```bash
npm install
npm run dev
```

In another terminal, start the reference mock server (CORS enabled, defaults to port **3000**):

```bash
git clone https://github.com/mosaic-avantos/frontendchallengeserver.git
cd frontendchallengeserver
npm install
npm start
```

Optional environment variables (see `.env.example`):

- `VITE_API_BASE_URL` (default: `http://localhost:3000`)
- `VITE_TENANT_ID` (default: `1`)
- `VITE_ACTION_BLUEPRINT_ID` (default: `bp_456`)
- `VITE_BLUEPRINT_VERSION_ID` (optional; when set, the client uses the documented `/blueprints/{id}/{version}/graph` route — the reference mock server matches the **unversioned** route)

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — typecheck + production build
- `npm test` — Vitest (unit + component tests)

## Architecture (high level)

- **API**: `src/api/actionBlueprintGraph.ts` builds the graph URL (mock vs versioned) and performs the fetch.
- **Graph domain**: `src/domain/formGraph.ts` indexes nodes/forms and walks prerequisite relationships to discover upstream forms (direct + transitive).
- **Extensible picker model**: `src/data-sources/types.ts` defines `PrefillDataSourceFactory` + `PickerNode` trees; `src/data-sources/defaultFactories.ts` wires default factories (global namespaces + upstream form fields).
- **Hooks**:
  - `useActionBlueprintGraph` owns network state for the graph payload.
  - `usePrefillEditorState` owns local editor state for toggles + mappings (keyed by form component key).

## Extending with new data sources

1. Implement a `PrefillDataSourceFactory` in a new module (see `globalPropertiesFactory` / `upstreamFormFieldsFactory` in `src/data-sources/defaultFactories.ts`).
2. Return one or more `PickerNode` **branch** roots; leaf nodes must include a typed `PrefillElementRef`.
3. If you introduce a new ref shape, extend `PrefillElementRef` in `src/data-sources/types.ts` and update `formatPrefillElementLabel` in `src/domain/prefillLabels.ts`.
4. Register the factory in the `defaultFactories` array in `src/App.tsx` (or inject factories via props/context if you outgrow a static list).

No changes are required to the modal or row UI as long as the factory outputs the shared `PickerNode` model.

## API references

- Docs endpoint family: `action-blueprint-graph-get` (see Avantos admin UI docs linked in the challenge).
- Mock route implemented by `frontendchallengeserver`: `GET /api/v1/:tenantId/actions/blueprints/:blueprintId/graph`
