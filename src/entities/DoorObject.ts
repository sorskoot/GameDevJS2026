import {Scene, TransformNode, Vector3} from '@babylonjs/core';
import {type AnimationManager, GameObject} from '@sorskoot/babylon-kit';
import {DoorTweenAnimator} from '../controllers/DoorAnimationController.ts';
import type {IOpenCloseAnimator} from '../controllers/IOpenCloseAnimator.ts';

export type DoorObjectOptions = {
    /**
     * Speed (Duration) that the door opens or closes (1 = 1s). Default .6.
     */
    speed?: number;

    /**
     * If true, the door opens in the opposite direction (negative angle)
     */
    reversed?: boolean

    /**
     * if locked, the door can't open hwn interacted with
     */
    locked?: boolean,

    /**
     * The maximum the door can be opened. 1(default) = 90 degrees.
     */
    max?: number,

}

export class DoorObject extends GameObject {

    private speed: number;
    private reversed: boolean;
    private locked: boolean;
    private max: number;
    private animator: IOpenCloseAnimator;

    constructor(name: string,
                scene: Scene,
                mesh: TransformNode,
                animationManager: AnimationManager,
                options?: DoorObjectOptions) {
        super(name, scene);
        this.node = mesh;
        this.speed = options?.speed ?? 0.6;
        this.reversed = options?.reversed ?? false;
        this.locked = options?.locked ?? false;
        this.max = options?.max ?? 1.0;
        this.node!.rotation = new Vector3(0, 0, 0);

        const openAngle = (this.reversed ? -1 : 1) * this.max * Math.PI / 2;
        const durationMs = this.speed * 1000;

        // create a tween-based animator for this door using the scene's animationManager
        const animator = new DoorTweenAnimator(animationManager, mesh, openAngle, durationMs, `${name}_OpenClose`);

        this.animator = animator;
    }

    public onStart(): void {
    }

    public onUpdate(_deltaTime: number): void {
    }

    public onInteract(): void {
        if (this.locked) {
            // can't open locked door
            return;
        }

        if (this.animator) {
            try {
                // Await toggle so we block repeated interactions until complete
                this.animator.toggle();
            } catch (e) {
                console.warn(`[DoorObject] animator.toggle() failed for ${this.name}`, e);
            }
            return;
        }

        // fallback immediate rotation
        this.node!.rotation.set(0, (this.reversed ? -1 : 1) * this.max * Math.PI / 2, 0);
    }

    public lock() {
        if (!this.locked) {
            // if an animator exists, play close when locking
            this.animator?.close?.();
        }
        this.locked = true;
    }

    public unload() {
        this.locked = false;
        this.animator?.dispose?.();
    }
}