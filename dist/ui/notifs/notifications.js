import { Notification } from "./noficationMaker.js";
export const notis = {};
document.addEventListener("DOMContentLoaded", (e) => {
    const copiedToClipBoardNotif = new Notification('Copied to clipboard!', 1000);
    notis.copiedToClipBoardNotif = copiedToClipBoardNotif;
});
//# sourceMappingURL=notifications.js.map