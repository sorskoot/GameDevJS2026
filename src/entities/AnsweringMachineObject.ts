import { AbstractSound, Mesh, type Scene } from "@babylonjs/core";
import { GameObject } from "@sorskoot/babylon-kit";
import type { StoryEventBus } from "../story-beats/StoryBeats";

export class AnsweringMachineObject extends GameObject {
    private beep: AbstractSound;

    constructor(
        scene: Scene,
        mesh: Mesh,
        beep: AbstractSound,
        private events: StoryEventBus,
    ) {
        super("AnsweringMachine", scene);
        this.node = mesh;
        this.beep = beep;
    }

    public onStart(): void {}

    public onUpdate(_deltaTime: number): void {}

    public onInteract(): void {
        console.log("Answering machine interacted with!");
        this.beep.play();
        this.events.emit({
            type: "answering-machine.used",
        });
    }
}
