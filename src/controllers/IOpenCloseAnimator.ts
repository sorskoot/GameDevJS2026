/**
 * Interface for anything that can open/close (doors, drawers, chests, etc)
 */
export interface IOpenCloseAnimator {
    open(): void;

    close(): void;

    toggle(): void;

    isOpen(): boolean;

    dispose?(): void;
}