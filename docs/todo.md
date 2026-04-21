# TODO

## 1 — Core Systems

- [x] Implement answering machine interaction
  - [x] Add table to hallway
  - [x] Add answering machine model
  - [x] Set up AnsweringMachine component
- [x] Implement message playback
- [ ] Implement room unlock system
- [ ] Implement environmental trigger system
- [ ] Implement look-at trigger
- [x] implement door opening/closing
- [x] Rough‑in all rooms
- [x] Create game flow system / manager to track progression and trigger events
- [ ] Add inspecting objects

Goal: Core loop working (message → unlock → explore).

## 2 — Environment Pass

- [ ] Add MUST‑HAVE props to each room
  - [ ] Create list of all props needed
- [ ] Add basic lighting
- [ ] Add basic ambient audio
- [ ] Add final void scene (minimal version)
  - [ ] Implement way to transition

Goal: All rooms visually readable.

## 3 — Narrative Implementation

- [ ] Finalize message scripts
- [x] Record placeholder audio
- [ ] Implement messages 1–6
- [ ] Implement environmental changes per beat

Goal: Full narrative playable from start to finish (rough).

## 4 — Audio & FX

- [ ] Add distortion filters
- [ ] Add flickering lights
- [ ] Add flash transition
- [ ] Add fade‑to‑black ending
- [ ] Add answering machine light behavior

Goal: Emotional beats feel stronger.

## 5 — Polish Pass

- [ ] Improve lighting
- [ ] Add subtle environmental details
- [ ] Add rumble, creaks, hums
- [ ] Add mirror flicker shader
- [ ] Add trail in living room

Goal: Apartment feels alive and unsettling.

## 6 — Final Scene Polish

- [ ] Improve void scene
- [ ] Add body silhouette + puddle + knife
- [ ] Disable locomotion
- [ ] Add final beep
- [ ] Add fade timing

Goal: Ending hits hard.

## 7 — QA + Final Audio

- [ ] Record final audio (clean takes)
- [ ] Mix audio levels
- [ ] Fix bugs
- [ ] Optimize performance
- [ ] Playtest pacing
- [ ] Final lighting pass

Goal: Game is jam‑ready.

---

## Decisions to make

[x] Choose Style (realistic, pixelated, ps2) => PSX (realistic-isch, with baked lighting and low poly models)
[] Jump scares or only psychological horror?
[] How to track game state/progression?
