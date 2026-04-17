import {EasingFunction, SineEase, TransformNode, Vector3} from '@babylonjs/core';
import {AnimationManager} from '@sorskoot/babylon-kit';
import type {IOpenCloseAnimator} from './IOpenCloseAnimator.ts';

export class DoorTweenAnimator implements IOpenCloseAnimator {
    private animationManager: AnimationManager;
    private node: TransformNode;
    private openAngle: number;
    private durationMs: number;
    private keyPrefix: string;
    private animating = false;
    private openState = false;

    constructor(animationManager: AnimationManager, node: TransformNode, openAngle: number, durationMs = 600, keyPrefix?: string) {
        this.animationManager = animationManager;
        this.node = node;
        this.openAngle = openAngle;
        this.durationMs = durationMs;
        this.keyPrefix = keyPrefix ?? `door_${node.name ?? Math.random().toString(36).slice(2)}`;
    }

    isOpen(): boolean {
        return this.openState;
    }

    open(): void {
        if (this.openState || this.animating) return;
        this.playTo(this.openAngle, `${this.keyPrefix}_open`);
        this.openState = true;
    }

    close(): void {
        if (!this.openState || this.animating) return;
        this.playTo(0, `${this.keyPrefix}_close`);
        this.openState = false;
    }

    toggle(): void {
        if (this.animating) {
            return;
        } // ignore while animating

        return this.openState ? this.close() : this.open();
    }

    dispose(): void {
        // stop any running tween in the animation manager and clear flags
        this.animationManager.stop(`${this.keyPrefix}_open`);
        this.animationManager.stop(`${this.keyPrefix}_close`);
        this.animating = false;
    }

    private playTo(targetY: number, key: string): void {
        // If node uses rotationQuaternion, this simple rotation tween won't work.
        if ((this.node as any).rotationQuaternion) {
            // Convert quaternion to Euler as a fallback (destructive) and warn.
            console.warn(`[DoorTweenAnimator] node ${this.node.name} has rotationQuaternion — converting to Euler and removing quaternion.`);
            // This cast assumes Babylon's Quaternion has toEulerAngles method or similar — adapt if needed.
            // Safer: set rotation from rotationQuaternion.toEulerAngles() if available.
            try {
                const quat = (this.node as any).rotationQuaternion;
                if (quat && typeof quat.toEulerAngles === 'function') {
                    (this.node as any).rotation = quat.toEulerAngles();
                }
            } catch {
                // ignore
            }
            (this.node as any).rotationQuaternion = null;
        }

        // stop any existing tween with the same keys
        this.animationManager.stop(`${this.keyPrefix}_open`);
        this.animationManager.stop(`${this.keyPrefix}_close`);

        const from = this.node.rotation.clone();
        const to = new Vector3(from.x, targetY, from.z);

        this.animating = true;

        const ease = new SineEase();
        // set easing mode enum in a safe cast (TypeScript typings in some Babylon versions differ)
        try {
            (ease as any).setEasingMode((EasingFunction as any).EASINGMODE_EASEINOUT);
        } catch {
            // ignore if not available
        }

        this.animationManager.tween(
            key,
            this.node,
            'rotation',
            from,
            to,
            this.node.getScene()!, // scene required by tween()
            {
                duration:       this.durationMs,
                easingFunction: ease,
                onComplete:     () => {
                    // ensure final rotation applied
                    this.node.rotation.copyFrom(to);
                    this.animating = false;
                },
            },
        );

    }
}
