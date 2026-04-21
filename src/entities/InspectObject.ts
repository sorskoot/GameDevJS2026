import type {Scene, TransformNode} from '@babylonjs/core';
import {GameObject} from '@sorskoot/babylon-kit';

/**
 * When an object with this GameObject is selected it is moved to the controller that is selecting it,
 * allowing the player to inspect it by moving it around and looking at it from different angles.
 * When not in VR, the object is moved in front of the camera and rotated on mouse move.
 *
 * Any movements are disabled until inspection is done.
 *
 * The original place of the object is stored. When inspection is done the object is placed back.
 */
export class InspectObject extends GameObject {
    constructor(name: string, scene: Scene, mesh: TransformNode) {
        super(name, scene);
        this.node = mesh;
    }

    public onStart(): void {
    }

    public onUpdate(_deltaTime: number): void {
    }

}