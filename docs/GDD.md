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
|   #5    | Bedroom 2   | Diary      | Final message plays |

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