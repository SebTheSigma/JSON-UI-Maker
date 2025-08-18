"use strict";
class MainWarningMessage {
    static shouldShow = false;
    static shown = false;
    static show() {
        this.shown = true;
        const mainWarningMessage = document.getElementById("mainWarningMessage");
        mainWarningMessage.style.display = "block";
        const okButton = document.getElementById("okButton");
        okButton.className = 'utilElement';
        okButton.addEventListener("click", () => this.hide());
    }
    static hide() {
        this.shown = false;
        const mainWarningMessage = document.getElementById("mainWarningMessage");
        mainWarningMessage.style.display = "none";
        this.clearMessages();
    }
    static addMessage(message) {
        const mainWarningMessage = document.getElementById("mainWarningMessage");
        mainWarningMessage.innerHTML += message;
    }
    static clearMessages() {
        const mainWarningMessage = document.getElementById("mainWarningMessage");
        mainWarningMessage.innerHTML = "";
    }
}
//# sourceMappingURL=showMainWarningMessage.js.map