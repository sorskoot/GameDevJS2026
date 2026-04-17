# Ghost in the Machine (working title)

Genre: Psychological Horror / Narrative Exploration (VR)

Platform: WebXR + Browser 3D

## Core Concept

The player is trapped in a small apartment where an old answering machine becomes the conduit for a haunting story. Each
message unlocks a new room, revealing fragments of a disturbing mystery involving murder, possession, and the
supernatural. The answering machine is both the storyteller and the antagonist.

## Gameplay Overview

Perspective: First-person VR

Environment: Single apartment (L-shaped hallway, 2 bedrooms, bathroom, kitchen, living room, storage closet)

Progression: The player starts in the hallway with a blinking answering machine. Each message unlocks one room and
advances the story.

Loop:

- Play message → unlock room
- Explore room → interact with objects
- Trigger next message → world changes
- Repeat until final revelation

## Core Mechanics

### Answering Machine Interaction

- Player presses a button to play messages.
- Light blinks when a new message is available.
- Messages trigger events (unlock doors, spawn objects, change lighting).

### Door System

- Doors start locked.
- Unlocks are triggered by message events.
- Doors can close or lock again dynamically for scares.

### Object Interaction

- Grab, inspect, rotate, and place objects.
- Certain objects trigger messages or environmental changes.

### Environmental Shifts

- Objects appear/disappear.
- Lighting changes.
- Audio cues (footsteps, whispers, static).

### Message → Event Pipeline

- Each message corresponds to a specific event chain.
- Example: Message #1 unlocks Bedroom 1 → Message #2 spawns toy → Message #3 changes hallway lighting.

## Narrative Structure

### Act 1: Discovery

Player finds the answering machine.
First message hints at a tragedy.
One room unlocks.

### Act 2: Investigation

Each room reveals fragments of the story.
Messages grow more personal and unsettling.
Environmental changes intensify.

### Act 3: Revelation

The final message reveals the truth — the answering machine is possessed by the victim’s spirit or the killer’s guilt.
The apartment becomes unstable (lights flicker, doors slam, whispers surround the player).

## Story Themes

Isolation and guilt
Technology as a conduit for the supernatural
The thin line between memory and haunting

### Visual & Audio Design

Visuals:

- Realistic apartment layout
- Subtle environmental storytelling (blood stains, photos, notes)
- Dynamic lighting for tension

Audio:

- Answering machine voice as central narrative device
- Ambient hums, creaks, whispers
- Gradual distortion of messages

## Technical Scope

### Tools & Frameworks

Engine:

- Babylon.js with custom Sorskoot Engine

Assets:

- Low-poly or stylized realistic models (not decided yet)
- Blender with custom plugin for adding details

Audio:

- Pre-recorded voice messages (AI?)
- Environmental sounds (footsteps, creaks, static, rain)

Other:

- Story with Articy Draft (?)

## Systems to Prototype First

- Door system
- Answering machine interaction
- Message event triggers
- Object interaction
- Environmental change system

Progression Example:

| Message | Unlocks     | Key Object | Event                |
|:-------:|:------------|:-----------|:---------------------|
|   #1    | Bedroom 1   | Photograph | Unlocks next message |
|   #2    | Bathroom    | Mirror     | Reflection changes   |
|   #3    | Kitchen     | Knife      | Lights flicker       |
|   #4    | Living Room | TV remote  | Static reveals voice |
|   #5    | Bedroom 2   | Diary      | Final message plays  |

Endgame:
Final message plays automatically.
Apartment distorts visually and audibly.
Player realizes they were the killer or the victim.
Fade to black with the answering machine repeating the first message.

## Development Plan (Jam Scale)

Week 1:

- Blockout apartment
- Implement core systems (doors, answering machine, interactions)
- Write story

Week 2:

- Add story events, voice messages, lighting, and sound design
- Polish pacing and transitions

Potential Expansions:

- Multiple endings based on object interactions
- Randomized message order for replayability
- Alternate voice sets (different hauntings)

## Summary

“Ghost in the Machine” is a compact, atmospheric VR horror experience built around one powerful mechanic — the answering
machine. Its simplicity makes it ideal for a jam or prototype, while its narrative depth offers room for expansion into
a full psychological horror title.

---

# RISK‑MITIGATION PLAN (VR Horror Answering Machine Game)

This plan covers:
The biggest risks
How to detect them early
What to cut or simplify
What to prioritize if time runs short
What absolutely must ship

## 1. Highest‑Risk Areas (and how to avoid disaster)

1.1 Audio Recording & Message Implementation
Risk: Without the messages, the game has no story.
Mitigation:

Write and record placeholder audio on Day 3

Replace with final audio on Day 7

Keep messages short (10–20 seconds max)

If time runs out:  
Use text subtitles instead of audio for messages 4–5.

1.2 Environmental Changes Per Beat
Risk: Too many props or complex effects will eat time.
Mitigation:

Use simple object toggles (visible/invisible)

Avoid physics objects

Avoid complex shaders unless already available

If time runs out:  
Cut all non‑essential props and keep only 1–2 key items per room.

1.3 Final Void Scene
Risk: Infinite void + lighting + body silhouette can be tricky.
Mitigation:

Use a large plane, not actual infinity

Use a simple dark skybox

Use a single static mesh for the body

If time runs out:  
Skip the void and fade to black after the final message.

1.4 VR Interaction
Risk: Interaction bugs can block progression.
Mitigation:

Keep interaction to one object only: the answering machine

No grabbing, no physics, no inventory

If time runs out:  
Trigger messages automatically when entering rooms.

1.5 Lighting & FX
Risk: Over‑ambitious lighting can break performance.
Mitigation:

Use baked or static lights

Use simple flicker scripts

Avoid volumetrics unless trivial

If time runs out:  
Cut all flicker and FX — rely on audio for tension.

## 2. Early Warning Signs (Red Flags)

If any of these happen by Day 3, you need to cut scope:

You’re still tweaking room layout

You haven’t implemented message playback

You’re stuck on lighting or shaders

You’re still writing the story

You’re debugging VR interaction issues

If any of these happen by Day 5, you must cut features:

Environmental changes aren’t working

Audio pipeline isn’t stable

Final scene isn’t loading correctly

## 3. What to Cut First (Safe Cuts)

These cuts won’t hurt the story and will save hours.

Cut 1 — Environmental clutter
Remove extra props, decorations, and small details.

Cut 2 — Advanced FX
Remove:

Chromatic aberration

Screen vignette

Mesh warping

Memory flashes

Cut 3 — Shadow movement / peripheral illusions
Atmospheric, but not essential.

Cut 4 — Mirror flicker shader
Replace with a simple texture swap.

Cut 5 — Trail in living room
Optional — the message already implies the truth.

## 4. What to Cut Last (Critical to keep)

These are non‑negotiable for the story to work:

Answering machine interaction

All 6 messages (even if text‑only)

Room progression

Environmental changes that reveal the truth

Final confession

Final scene (even minimal)

If these break, the game collapses.

## 5. Minimal Viable Version (If everything goes wrong)

If you hit a crisis, here’s the bare‑bones version that still works:

Rooms
Hallway

Kitchen

Bedroom

Bathroom

Living room

Final void

Props
Ring box

Broken frame

Shoe

Suitcase

Handprint

Overturned chair

Body silhouette

Knife

Audio
6 messages (can be text‑only)

Ambient loop

Final beep

FX
Flash to white

Fade to black

This version can be built in 3–4 days if needed.

## 6. Priority Pyramid (What matters most)

Tier 1 — MUST SHIP
Core loop (message → unlock → explore)

6 messages

Environmental storytelling

Final scene

Tier 2 — SHOULD SHIP
Ambient audio

Basic lighting

Basic FX

Tier 3 — NICE TO HAVE
Distortion filters

Flickering lights

Extra props

Tier 4 — CUT IF NEEDED
Advanced shaders

Extra audio layers

Peripheral illusions

## 7. Emergency 24‑Hour Plan (If you fall behind)

If you reach Day 6 and you’re behind:

Step 1 — Lock the story
Messages must be final

Room progression must work

Step 2 — Build the final scene
Void

Body

Knife

Fade

Step 3 — Add minimal audio
Ambient loop

Message playback

Final beep

Step 4 — Remove all non‑essential props
Step 5 — Playtest for clarity
If the story is clear, the game works.