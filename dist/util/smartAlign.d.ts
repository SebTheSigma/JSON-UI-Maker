/**
 * Smart alignment utility for snapping elements to sibling and parent guides during drag.
 *
 * Usage pattern in your drag handler:
 *   const snap = SmartAligner.computeSnap({
 *     container: classElement.container,
 *     movingEl: mainElement,
 *     proposedLeft: newLeft,
 *     proposedTop: newTop,
 *   });
 *   mainElement.style.left = `${snap.left}px`;
 *   mainElement.style.top = `${snap.top}px`;
 *   SmartAligner.showGuides(classElement.container, snap.guides);
 *
 * On drag end:
 *   SmartAligner.clearGuides(classElement.container);
 *
 * Notes:
 * - Tolerance defaults to config.settings.smart_align_radius if present,
 *   else config.settings.grid_lock_radius, else 6px.
 * - Snaps to sibling edges/centers and parent edges/center-lines.
 * - Only considers siblings that are main draggable elements (from AllJsonUIElements).
 */
export type GuideOrientation = "vertical" | "horizontal";
export type GuideKind = "left" | "centerX" | "right" | "top" | "centerY" | "bottom";
export interface Guide {
    orientation: GuideOrientation;
    position: number;
    kind: GuideKind;
    source: HTMLElement | "parent";
}
export interface AlignOptions {
    tolerance: number;
    includeParent: boolean;
    includeSiblings: boolean;
    snapEdges: boolean;
    snapCenters: boolean;
}
export interface SnapResult {
    left: number;
    top: number;
    snappedX: boolean;
    snappedY: boolean;
    guides: Guide[];
}
export declare class SmartAligner {
    private static guideMap;
    static isEnabled(): boolean;
    static computeSnap(params: {
        container: HTMLElement;
        movingEl: HTMLElement;
        proposedLeft: number;
        proposedTop: number;
        options?: Partial<AlignOptions>;
    }): SnapResult;
    static showGuides(container: HTMLElement, guides: Guide[]): void;
    static clearGuides(container: HTMLElement): void;
}
export default SmartAligner;
