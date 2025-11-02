
const modal: HTMLElement = document.getElementById("modalHelpMenu")!;
const closeBtn: HTMLElement = document.getElementById("modalHelpMenuClose") as HTMLElement;


export async function helpModal() {
    modal.style.display = "block";
}

/**
 * Hides the add button modal
 */
closeBtn.onclick = () => {
    modal.style.display = "none";
};

/**
 * Closes the settings modal when the user clicks outside of it.
 * If the click event's target is the modal itself (indicating a click
 */
window.addEventListener("click", (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
});

