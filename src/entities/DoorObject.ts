import {Scene, TransformNode, Vector3} from '@babylonjs/core';
import {GameObject} from '@sorskoot/babylon-kit';

export class DoorObject extends GameObject {

    private speed: number;
    private reversed: boolean;
    private locked: boolean;
    private max: number;

    constructor(name: string,
                scene: Scene,
                mesh: TransformNode,
                options?: {
                    speed?: number;
                    reversed?: boolean
                    locked?: boolean,
                    max?: number
                }) {
        super(name, scene);
        this.node = mesh;
        this.speed = options?.speed ?? 1;
        this.reversed = options?.reversed ?? false;
        this.locked = options?.locked ?? false;
        this.max = options?.max ?? 1.0;
        this.node!.rotation = new Vector3(0, 0, 0);
    }

    public onStart(): void {
    }

    public onUpdate(_deltaTime: number): void {
    }

    public onInteract(): void {
        if(this.locked) {
            // can't open locked door
            return;
        }
        this.node!.rotation.set(0, (this.reversed ? -1 : 1) * this.max * Math.PI / 2,0);
    }

    public lock(){
        if(!this.locked) {
            // close door.
        }
        this.locked = true;
    }

    public unload(){
        this.locked = false;
    }
}