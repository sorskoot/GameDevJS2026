# AGENTS.md — GameDevJS2026

## Project Overview
**"Ghost in the Machine"** — a WebXR psychological horror game built with Babylon.js v9 + a local custom engine package (`@sorskoot/babylon-kit`, installed from `../BJS-GameEngine/sorskoot-babylon-kit-0.1.1.tgz`). Single-scene, first-person apartment exploration where an answering machine drives linear (but branchable) story progression. Targets both desktop browser and Meta Quest via WebXR.

## Key Commands
```bash
npm run dev          # Vite dev server on port 4623, host 0.0.0.0
npm run build        # tsc + vite build
npm run assets       # AssetPack pipeline: raw-assets/ → public/assets/
npm run assets:watch # AssetPack in watch mode
```
Set `VITE_META_QUEST_ADB_PATH` in a `.env` file to enable automatic ADB port-forwarding to a connected Quest headset (handled by `scripts/meta-quest-adb-port-forwarding.plugin.ts`).

## Architecture

### Layer Map
```
main.ts
  ├── Game (babylon-kit)        — engine, managers bootstrap
  ├── StoryBeatsManager         — singleton story state machine (src/story-beats/)
  └── MainScene (GameScene)     — single scene, wires everything together
        ├── assetManager.loadModel()  — loads GLBs from /assets/models/
        ├── metadataRepository        — babylon-kit; reads mesh metadata from GLB
        │     ├── SorskootEntryTypes.Door → DoorObject instances
        │     └── getById("AnsweringMachine") → AnsweringMachineObject
        └── interactionManager.enableInteraction(obj)  — registers onInteract()
```

### Story Beat System (`src/story-beats/`)
- `StoryBeatsManager` is a **forward-only state machine** with optional `goTo(name)` jumps.
- `StoryBeat` base class: override `onStart()` / `onEnd()`. Use `this.listen(type, handler)` for **auto-disposed** event subscriptions.
- `StoryBeatContext` exposes `events` (bus), `state` (shared flags/rooms/doors), `next()`, `goTo()`, `setFlag()`.
- Register all beats in `main.ts` via `storyBeatsManager.registerBeats(ctx => [...])` **before** `game.start()`.
- New beats go in `src/story-beats/CustomBeat.ts` (for game-specific beats) or as separate files.

### Entity Pattern (`src/entities/`)
All interactive objects extend `GameObject` (babylon-kit):
```ts
class MyObject extends GameObject {
    constructor(scene, mesh, ...) { super("name", scene); this.node = mesh; }
    onStart(): void {}
    onUpdate(dt: number): void {}
    onInteract(): void { /* emit story event */ }
}
```
Register with: `this.addGameObject(key, obj)` + `this.interactionManager.enableInteraction(obj)`.

### Doors
- Doors are authored in the GLB with metadata (`SorskootEntryTypes.Door`). Properties `reversed` and `locked` come from mesh metadata.
- `DoorObject` delegates animation to `DoorTweenAnimator` (`src/controllers/`), which uses `animationManager.tween()` with a SineEase curve.
- Nodes **must not** have `rotationQuaternion` set; the animator converts and warns if it finds one.

### Story Events (discriminated union in `StoryBeats.ts`)
```ts
type StoryEvent =
  | { type: "answering-machine.used" }
  | { type: "message.started"; messageId: string }
  | { type: "message.finished"; messageId: string }
  | { type: "door.opened"; doorId: string }
  | { type: "room.entered"; roomId: string }
  | { type: "flag.set"; flag: string };
```
Emit: `storyBeatsManager.events.emit({ type: "door.opened", doorId: "kitchen" })`.
Subscribe from outside beats: `storyBeatsManager.events.on("door.opened", e => ...)`.

## Asset Pipeline
- **Source**: `raw-assets/models/*.glb`, `raw-assets/sfx/*.wav`
- **Output**: `public/assets/` (models as `.glb`, audio as `.ogg` + `.mp3`)
- **Manifest**: `public/assets/assets-manifest.json` — update this when adding assets.
- AssetPack config: `scripts/assetpack-fbx-to-glb.plugin.mjs`.

## Conventions
- TypeScript strict mode; `verbatimModuleSyntax` — always use `import type` for type-only imports.
- `.ts` extensions are allowed in imports (`allowImportingTsExtensions: true`).
- All textures use `NEAREST_SAMPLINGMODE` (set globally in `MainScene.setup()`).
- SSAO pipeline is present but commented out; re-enable carefully for performance.
- `WebXRMotionControllerManager.UseOnlineRepository = false` — controller models must be local.

## Key Files
| File | Purpose |
|------|---------|
| `src/main.ts` | Entry point, beat registration order |
| `src/scenes/MainScene.ts` | Scene setup, metadata → entity wiring |
| `src/story-beats/StoryBeats.ts` | Beat base class, event bus, shared state types |
| `src/story-beats/CustomBeat.ts` | Game-specific beat implementations |
| `src/entities/AnsweringMachineObject.ts` | Core interactive prop pattern |
| `src/controllers/DoorAnimationController.ts` | Tween-based open/close animator |
| `docs/GDD.md` | Full game design & story breakdown |
| `public/assets/assets-manifest.json` | Runtime asset registry |

