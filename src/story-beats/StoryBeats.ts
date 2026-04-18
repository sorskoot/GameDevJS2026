/*

Thoughts:
StoryBeats is basically a state magine to manage the flow of the story of the game.

- Basic state machine should be very simple
- Should build with extensibility in mind
- Basic flow is forward, but branching should be possible
- I have no idea how, but having the possibility to visualize the story would be cool

- When certain conditions are met, the story beat should transition to the next

Questions:
- Should the transition be a beat in itself? So that something can happen during a transition? Something like a fade or a cutscene?
- How to implement cheching conditions for transitions? Should it be a function that is called every frame, or should it be an event-based system where certain events trigger the transition?

*/

/**
 * Domain events that drive story progression.
 */
export type StoryEvent =
    | { type: "answering-machine.used" }
    | { type: "message.started"; messageId: string }
    | { type: "message.finished"; messageId: string }
    | { type: "door.opened"; doorId: string }
    | { type: "room.entered"; roomId: string }
    | { type: "flag.set"; flag: string };

type StoryEventType = StoryEvent["type"];
type StoryEventHandler<T extends StoryEventType> =
    (event: Extract<StoryEvent, { type: T }>) => void;

/**
 * Shared mutable story state that beats can read and update.
 */
export type StoryState = {
    /** Arbitrary boolean flags used by beats for branching and gating. */
    flags: Record<string, boolean>;
    /** Rooms the player has already entered. */
    visitedRooms: Set<string>;
    /** Doors that have been unlocked by story progression. */
    unlockedDoors: Set<string>;
    /** The currently active message, if one is playing. */
    currentMessageId?: string;
};

/**
 * Lightweight event bus for subscribing to and emitting story events.
 */
export class StoryEventBus {
    private handlers = new Map<StoryEventType, Set<(event: StoryEvent) => void>>();

    /**
     * Subscribes to a specific story event type.
     *
     * @typeParam T The event type to subscribe to.
     * @param type The event discriminator to listen for.
     * @param handler Callback invoked whenever an event of the requested type is emitted.
     * @returns A disposer that removes the subscription.
     */
    public on<T extends StoryEventType>(
        type: T,
        handler: StoryEventHandler<T>,
    ): () => void {
        const currentHandlers = this.handlers.get(type) ?? new Set();
        currentHandlers.add(handler as (event: StoryEvent) => void);
        this.handlers.set(type, currentHandlers);

        return () => {
            currentHandlers.delete(handler as (event: StoryEvent) => void);
            if (currentHandlers.size === 0) {
                this.handlers.delete(type);
            }
        };
    }

    /**
     * Emits a story event to all current subscribers of that event type.
     *
     * @param event The event payload to publish.
     */
    public emit(event: StoryEvent): void {
        const currentHandlers = this.handlers.get(event.type);
        if (!currentHandlers) return;

        for (const handler of currentHandlers) {
            handler(event);
        }
    }
}

/**
 * Services exposed to each beat so it can react to events and control flow.
 */
export type StoryBeatContext = {
    /** Shared state for the full story run. */
    state: StoryState;
    /** Event bus used to observe and emit story events. */
    events: StoryEventBus;
    /** Advances to the next registered beat. */
    next: () => void;
    /** Jumps directly to a named beat. */
    goTo: (beatName: string) => void;
    /** Sets a story flag, optionally providing an explicit value. */
    setFlag: (flag: string, value?: boolean) => void;
};

/**
 * Represents a single beat in the story. Each beat has a unique ID and a 
 * name. The onStart and onEnd methods can be overridden to define custom 
 * behavior when the beat starts and ends.
 */
export class StoryBeat {
    public readonly id: number;
    private disposers: Array<() => void> = [];

    /**
     * Creates a story beat.
     *
     * @param name Human-readable unique name for the beat.
     * @param context Shared beat services and story state.
     */
    constructor(
        public readonly name: string,
        protected readonly context: StoryBeatContext,
    ) {
        this.id = StoryBeatsManager.nextId();
    }

    /**
     * Called when this beat becomes active.
     * Override in subclasses to subscribe to events or trigger setup work.
     */
    public onStart(): void {}

    /**
     * Called when this beat is exited.
     * Clears all event subscriptions registered through {@link listen}.
     */
    public onEnd(): void {
        for (const dispose of this.disposers) {
            dispose();
        }
        this.disposers = [];
    }

    /**
     * Registers a scoped event listener that is automatically disposed when the beat ends.
     *
     * @typeParam T The event type to subscribe to.
     * @param type The event discriminator to listen for.
     * @param handler Callback invoked when the event is emitted.
     */
    protected listen<T extends StoryEventType>(
        type: T,
        handler: StoryEventHandler<T>,
    ): void {
        const dispose = this.context.events.on(type, handler);
        this.disposers.push(dispose);
    }

    /**
     * Advances story flow to the next beat.
     */
    protected next(): void {
        this.context.next();
    }

    /**
     * Jumps story flow directly to a named beat.
     *
     * @param beatName The name of the beat to activate.
     */
    protected goTo(beatName: string): void {
        this.context.goTo(beatName);
    }

    /**
     * Updates a story flag in shared state.
     *
     * @param flag The flag name to set.
     * @param value The value to store. Defaults to `true`.
     */
    protected setFlag(flag: string, value = true): void {
        this.context.setFlag(flag, value);
    }

    /**
     * Provides access to the shared story state.
     */
    protected get state(): StoryState {
        return this.context.state;
    }
}

/**
 * Manages the flow of the story by keeping track of the registered story 
 * beats
 */
class StoryBeatsManager {
    private storyBeats: StoryBeat[] = [];
    private currentBeatIndex = -1;

    /** Event bus shared by all beats and gameplay systems. */
    public readonly events = new StoryEventBus();
    /** Mutable state shared across the full story sequence. */
    public readonly state: StoryState = {
        flags: {},
        visitedRooms: new Set(),
        unlockedDoors: new Set(),
    };

    /**
     * Registers the beats that make up the story flow.
     *
     * @param factory Factory invoked once with the shared beat context.
     */
    public registerBeats(factory: (context: StoryBeatContext) => StoryBeat[]): void {
        const context: StoryBeatContext = {
            state: this.state,
            events: this.events,
            next: () => this.next(),
            goTo: (beatName) => this.goTo(beatName),
            setFlag: (flag, value = true) => {
                this.state.flags[flag] = value;
                this.events.emit({ type: "flag.set", flag });
            },
        };

        this.storyBeats.push(...factory(context));
    }

    /**
     * Starts story progression at the first registered beat.
     */
    public start(): void {
        if (this.storyBeats.length === 0) {
            console.warn("No story beats registered.");
            return;
        }
        console.log("Starting story...");
        this.currentBeatIndex = 0;
        this.storyBeats[this.currentBeatIndex].onStart();
    }

    /**
     * Ends the current beat and advances to the next registered beat.
     */
    public next(): void {
        if (this.currentBeatIndex < 0) return;

        this.storyBeats[this.currentBeatIndex].onEnd();

        this.currentBeatIndex += 1;
        if (this.currentBeatIndex >= this.storyBeats.length) {
            console.log("Story complete.");
            return;
        }

        this.storyBeats[this.currentBeatIndex].onStart();
    }

    /**
     * Ends the current beat and activates a beat by name.
     *
     * @param beatName The name of the beat to activate.
     */
    public goTo(beatName: string): void {
        const nextIndex = this.storyBeats.findIndex((beat) => beat.name === beatName);
        if (nextIndex === -1) {
            console.warn(`Unknown beat: ${beatName}`);
            return;
        }

        if (this.currentBeatIndex >= 0) {
            this.storyBeats[this.currentBeatIndex].onEnd();
        }

        this.currentBeatIndex = nextIndex;
        this.storyBeats[this.currentBeatIndex].onStart();
    }

    private static idCounter = 0;

    /**
     * Generates the next unique story beat identifier.
     *
     * @returns A numeric beat identifier.
     */
    public static nextId(): number {
        return this.idCounter++;
    }
}

/**
 * Singleton instance of the StoryBeatsManager to be used throughout the game.
 */
export const storyBeatsManager = new StoryBeatsManager();
