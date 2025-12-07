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

import { config } from "../CONFIG.js";
import { AllJsonUIElements } from "../elements/elements.js";

export type GuideOrientation = "vertical" | "horizontal";
export type GuideKind = "left" | "centerX" | "right" | "top" | "centerY" | "bottom";

export interface Guide {
  orientation: GuideOrientation;
  position: number; // in container-local px coordinates
  kind: GuideKind;
  source: HTMLElement | "parent";
}

export interface AlignOptions {
  tolerance: number; // snap threshold in px
  includeParent: boolean; // include parent guides
  includeSiblings: boolean; // include sibling guides
  snapEdges: boolean; // left/top/right/bottom
  snapCenters: boolean; // center X / center Y
}

export interface SnapResult {
  left: number;
  top: number;
  snappedX: boolean;
  snappedY: boolean;
  guides: Guide[]; // guides used for snapping (up to 2)
}

type RectLike = {
  left: number;
  top: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
  centerX: number;
  centerY: number;
};

function getDefaultOptions(): AlignOptions {
  const tol =
    (config as any)?.settings?.smart_align_radius?.value ??
    (config as any)?.settings?.grid_lock_radius?.value ??
    6;

  // If there's no explicit toggle, assume enabled by default
  const enabled = (config as any)?.settings?.smart_align?.value ?? true;

  // Optional flags (fall back to enabled where it makes sense)
  const includeParent =
    (config as any)?.settings?.smart_align_include_parent?.value ?? enabled;
  const includeSiblings =
    (config as any)?.settings?.smart_align_include_siblings?.value ?? enabled;
  const snapEdges =
    (config as any)?.settings?.smart_align_snap_edges?.value ?? true;
  const snapCenters =
    (config as any)?.settings?.smart_align_snap_centers?.value ?? true;

  return {
    tolerance: typeof tol === "number" ? tol : 6,
    includeParent: includeParent === true,
    includeSiblings: includeSiblings === true,
    snapEdges: snapEdges === true,
    snapCenters: snapCenters === true,
  };
}

function toContainerRect(el: HTMLElement, container: HTMLElement): RectLike {
  const elRect = el.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  const left = elRect.left - containerRect.left;
  const top = elRect.top - containerRect.top;
  const width = elRect.width;
  const height = elRect.height;

  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    centerX: left + width / 2,
    centerY: top + height / 2,
  };
}

function buildParentRect(container: HTMLElement): RectLike {
  const c = container.getBoundingClientRect();
  return {
    left: 0,
    top: 0,
    width: c.width,
    height: c.height,
    right: c.width,
    bottom: c.height,
    centerX: c.width / 2,
    centerY: c.height / 2,
  };
}

function isMainDraggable(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  if (el.dataset.skip === "true") return false;

  for (const className of AllJsonUIElements) {
    if (el.classList.contains(className)) return true;
  }
  return false;
}

function gatherSiblingRects(container: HTMLElement, movingEl: HTMLElement): RectLike[] {
  const out: RectLike[] = [];
  const children = Array.from(container.children);
  for (const child of children) {
    if (!isMainDraggable(child)) continue;
    if (child === movingEl) continue;
    out.push(toContainerRect(child, container));
  }
  return out;
}

function buildGuidePositionsFromRect(
  rect: RectLike,
  movingWidth: number,
  movingHeight: number,
  source: HTMLElement | "parent",
  options: AlignOptions
): { xCandidates: Array<{ value: number; guide: Guide }>; yCandidates: Array<{ value: number; guide: Guide }> } {
  const xCandidates: Array<{ value: number; guide: Guide }> = [];
  const yCandidates: Array<{ value: number; guide: Guide }> = [];

  // X-axis candidates (left positions that align moving left/center/right to rect's guides)
  if (options.snapEdges) {
    // Align moving left to rect.left
    xCandidates.push({
      value: rect.left,
      guide: { orientation: "vertical", position: rect.left, kind: "left", source },
    });

    // Align moving right to rect.right
    xCandidates.push({
      value: rect.right - movingWidth,
      guide: { orientation: "vertical", position: rect.right, kind: "right", source },
    });
  }
  if (options.snapCenters) {
    // Align moving centerX to rect.centerX
    xCandidates.push({
      value: rect.centerX - movingWidth / 2,
      guide: { orientation: "vertical", position: rect.centerX, kind: "centerX", source },
    });
  }

  // Y-axis candidates (top positions that align moving top/center/bottom to rect's guides)
  if (options.snapEdges) {
    // Align moving top to rect.top
    yCandidates.push({
      value: rect.top,
      guide: { orientation: "horizontal", position: rect.top, kind: "top", source },
    });

    // Align moving bottom to rect.bottom
    yCandidates.push({
      value: rect.bottom - movingHeight,
      guide: { orientation: "horizontal", position: rect.bottom, kind: "bottom", source },
    });
  }
  if (options.snapCenters) {
    // Align moving centerY to rect.centerY
    yCandidates.push({
      value: rect.centerY - movingHeight / 2,
      guide: { orientation: "horizontal", position: rect.centerY, kind: "centerY", source },
    });
  }

  return { xCandidates, yCandidates };
}

function buildAllCandidates(
  container: HTMLElement,
  movingEl: HTMLElement,
  movingWidth: number,
  movingHeight: number,
  options: AlignOptions
): { x: Array<{ value: number; guide: Guide }>; y: Array<{ value: number; guide: Guide }> } {
  const x: Array<{ value: number; guide: Guide }> = [];
  const y: Array<{ value: number; guide: Guide }> = [];

  // Parent guides
  if (options.includeParent) {
    const pRect = buildParentRect(container);
    const parent = buildGuidePositionsFromRect(pRect, movingWidth, movingHeight, "parent", options);
    x.push(...parent.xCandidates);
    y.push(...parent.yCandidates);
  }

  // Sibling guides
  if (options.includeSiblings) {
    const siblingRects = gatherSiblingRects(container, movingEl);
    for (const sRect of siblingRects) {
      const sibling = buildGuidePositionsFromRect(sRect, movingWidth, movingHeight, movingEl, options);
      x.push(...sibling.xCandidates);
      y.push(...sibling.yCandidates);
    }
  }

  return { x, y };
}

function pickSnapValue(
  proposed: number,
  candidates: Array<{ value: number; guide: Guide }>,
  tolerance: number
): { snapped: boolean; value: number; guide?: Guide } {
  let best: { diff: number; value: number; guide?: Guide } | null = null;

  for (const c of candidates) {
    const diff = Math.abs(c.value - proposed);
    if (diff <= tolerance) {
      if (!best || diff < best.diff) {
        best = { diff, value: c.value, guide: c.guide };
      }
    }
  }

  if (best) {
    return { snapped: true, value: best.value, guide: best.guide };
  }
  return { snapped: false, value: proposed };
}

export class SmartAligner {
  // Keep track of rendered guide lines per container to clear them later
  private static guideMap = new WeakMap<HTMLElement, HTMLElement[]>();

  static isEnabled(): boolean {
    // If there's no explicit toggle, assume enabled by default
    return ((config as any)?.settings?.smart_align?.value ?? true) === true;
  }

  static computeSnap(params: {
    container: HTMLElement;
    movingEl: HTMLElement;
    proposedLeft: number;
    proposedTop: number;
    options?: Partial<AlignOptions>;
  }): SnapResult {
    const { container, movingEl, proposedLeft, proposedTop } = params;

    if (!this.isEnabled()) {
      return { left: proposedLeft, top: proposedTop, snappedX: false, snappedY: false, guides: [] };
    }

    const defaults = getDefaultOptions();
    const opts: AlignOptions = { ...defaults, ...(params.options || {}) };

    // Use current size of the element for alignment
    const movingRect = toContainerRect(movingEl, container);
    const w = movingRect.width;
    const h = movingRect.height;

    const all = buildAllCandidates(container, movingEl, w, h, opts);

    const xSnap = pickSnapValue(proposedLeft, all.x, opts.tolerance);
    const ySnap = pickSnapValue(proposedTop, all.y, opts.tolerance);

    const guides: Guide[] = [];
    if (xSnap.snapped && xSnap.guide) guides.push(xSnap.guide);
    if (ySnap.snapped && ySnap.guide) guides.push(ySnap.guide);

    return {
      left: xSnap.value,
      top: ySnap.value,
      snappedX: xSnap.snapped,
      snappedY: ySnap.snapped,
      guides,
    };
  }

  static showGuides(container: HTMLElement, guides: Guide[]): void {
    this.clearGuides(container);
    if (!guides || guides.length === 0) return;

    const containerRect = container.getBoundingClientRect();
    const created: HTMLElement[] = [];

    for (const g of guides) {
      const line = document.createElement("div");
      line.className = "smart-align-guide";
      line.style.position = "absolute";
      line.style.pointerEvents = "none";
      line.style.zIndex = "2147483646"; // visible above most elements

      if (g.orientation === "vertical") {
        line.style.left = `${Math.round(g.position)}px`;
        line.style.top = `0px`;
        line.style.width = "1px";
        line.style.height = `${Math.round(containerRect.height)}px`;
        line.style.background = "rgba(46, 125, 50, 0.9)"; // green-ish
      } else {
        line.style.left = `0px`;
        line.style.top = `${Math.round(g.position)}px`;
        line.style.width = `${Math.round(containerRect.width)}px`;
        line.style.height = "1px";
        line.style.background = "rgba(21, 101, 192, 0.9)"; // blue-ish
      }

      created.push(line);
      container.appendChild(line);
    }

    this.guideMap.set(container, created);
  }

  static clearGuides(container: HTMLElement): void {
    const existing = this.guideMap.get(container);
    if (!existing) return;
    for (const el of existing) {
      if (el.parentElement === container) {
        container.removeChild(el);
      } else {
        el.remove();
      }
    }
    this.guideMap.delete(container);
  }
}

export default SmartAligner;
