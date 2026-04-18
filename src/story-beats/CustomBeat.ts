import { StoryBeat, type StoryBeatContext } from "./StoryBeats";

export class CustomBeat extends StoryBeat {
    constructor(context: StoryBeatContext) {
        super("custom", context);
    }
}

export class IntroBeat extends StoryBeat {
    constructor(context: StoryBeatContext) {
        super("intro", context);
    }

    public override onStart(): void {
        console.log("Intro beat started");

        this.listen("answering-machine.used", () => {
            this.context.events.emit({
                type: "message.started",
                messageId: "intro-message",
            });
        });

        this.listen("message.finished", (event) => {
            if (event.messageId !== "intro-message") return;

            this.state.unlockedDoors.add("kitchen");
            this.next();
        });
    }
}