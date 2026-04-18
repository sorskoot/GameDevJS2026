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

export type StoryState = {
    flags: Record<string, boolean>;
    visitedRooms: Set<string>;
    unlockedDoors: Set<string>;
    currentMessageId?: string;
};

export class StoryEventBus {
    private handlers = new Map<StoryEventType, Set<(event: StoryEvent) => void>>();

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

    public emit(event: StoryEvent): void {
        const currentHandlers = this.handlers.get(event.type);
        if (!currentHandlers) return;

        for (const handler of currentHandlers) {
            handler(event);
        }
    }
}

export type StoryBeatContext = {
    state: StoryState;
    events: StoryEventBus;
    next: () => void;
    goTo: (beatName: string) => void;
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

    constructor(
        public readonly name: string,
        protected readonly context: StoryBeatContext,
    ) {
        this.id = StoryBeatsManager.nextId();
    }

    public onStart(): void {}

    public onEnd(): void {
        for (const dispose of this.disposers) {
            dispose();
        }
        this.disposers = [];
    }

    protected listen<T extends StoryEventType>(
        type: T,
        handler: StoryEventHandler<T>,
    ): void {
        const dispose = this.context.events.on(type, handler);
        this.disposers.push(dispose);
    }

    protected next(): void {
        this.context.next();
    }

    protected goTo(beatName: string): void {
        this.context.goTo(beatName);
    }

    protected setFlag(flag: string, value = true): void {
        this.context.setFlag(flag, value);
    }

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

    public readonly events = new StoryEventBus();
    public readonly state: StoryState = {
        flags: {},
        visitedRooms: new Set(),
        unlockedDoors: new Set(),
    };

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

    public start(): void {
        if (this.storyBeats.length === 0) {
            console.warn("No story beats registered.");
            return;
        }
        console.log("Starting story...");
        this.currentBeatIndex = 0;
        this.storyBeats[this.currentBeatIndex].onStart();
    }

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

    public static nextId(): number {
        return this.idCounter++;
    }
}

/**
 * Singleton instance of the StoryBeatsManager to be used throughout the game.
 */
export const storyBeatsManager = new StoryBeatsManager();
