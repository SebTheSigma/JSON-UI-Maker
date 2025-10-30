import { config } from "../CONFIG.js";

function zoom(delta: number): void {
    const newZoom = Math.max(config.zoom + delta, 0.1);
    config.rootElement!.style.transform = `scale(${newZoom})`;

    const zoomLabel = document.getElementById("zoom_label")!;
    zoomLabel.innerText = `${(newZoom * 100).toFixed(0)}%`;

    config.zoom = newZoom;
}

const zoom_in = document.getElementById("zoom_in") as HTMLImageElement;
const zoom_out = document.getElementById("zoom_out") as HTMLImageElement;
let holdTimer: NodeJS.Timeout | undefined;

async function startHoldZoom(zoomAmount: number): Promise<void> {
    zoom(zoomAmount);

    holdTimer = setInterval(() => zoom(zoomAmount), 100);
}

function stopHold() {
    clearInterval(holdTimer);
}

// Mouse events
zoom_in.addEventListener("mousedown", startHoldZoom.bind(null, 0.1));
zoom_in.addEventListener("mouseup", stopHold);
zoom_in.addEventListener("mouseleave", stopHold);

zoom_out.addEventListener("mousedown", startHoldZoom.bind(null, -0.1));
zoom_out.addEventListener("mouseup", stopHold);
zoom_out.addEventListener("mouseleave", stopHold);
