import { config } from "../CONFIG.js";
import { DraggableButton } from "../elements/button.js";
import { DraggableCanvas } from "../elements/canvas.js";
import { GLOBAL_ELEMENT_MAP } from "../index.js";
const slider = document.getElementById("ui_scale_slider");
slider.valueAsNumber = config.magicNumbers.UI_SCALAR * 100;
slider.oninput = (e) => {
    console.log(slider.valueAsNumber);
    config.magicNumbers.UI_SCALAR = slider.valueAsNumber / 100;
    const allElements = Array.from(GLOBAL_ELEMENT_MAP.values());
    const allImages = allElements.filter((element) => element instanceof DraggableCanvas);
    const allButtons = allElements.filter((element) => element instanceof DraggableButton);
    allImages.forEach((image) => image.drawImage(image.canvas.width, image.canvas.height, false));
    allButtons.forEach((button) => button.drawImage(button.canvas.width, button.canvas.height, button.imageDataDefault, false));
};
//# sourceMappingURL=scale.js.map