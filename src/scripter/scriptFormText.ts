import { FormButtonData } from "./generator";

/**
 * Generates a script in JavaScript that creates a custom form in Minecraft Bedrock server.
 * The form contains buttons with the specified text and texture.
 * The script will be run on the server, and when the player uses the "stick" item, it will show the form.
 * The form will be shown using the show() method, which returns a Promise that resolves when the player closes the form.
 * The Promise is ignored in this script.
 * @param {FormButtonData[]} buttons The buttons to add to the form. Each button should have a "text" and "texture" property.
 * @returns {string} The script as a string.
 */
export function buttonDataToJavaScript(buttons: FormButtonData[]): string {

    return `
import { system, world } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';

function showCustomForm(player) {
    const form = new ActionFormData();
${buttons.map(button => `    form.button("${button.text}", "${button.texture}");`).join('\n')}

    form.show(player).then(r => {
        
    })
}

world.beforeEvents.itemUse.subscribe(ev => {
    const item = ev.itemStack;
    const player = ev.source;
    
    if (item.typeId == 'minecraft:stick') {
        system.run(() => {
            showCustomForm(player);
        })
    }
})
`;

}

/**
 * Generates a script in TypeScript that creates a custom form in Minecraft Bedrock server.
 * The form contains buttons with the specified text and texture.
 * The script uses the stick item to trigger the form to show.
 * @param buttons An array of objects containing the text and texture of each button.
 * @returns A string representing the generated script.
 */
export function buttonDataToTypeScript(buttons: FormButtonData[]): string {

    return `
import { system, world, Player } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';

function showCustomForm(player: Player) {
    const form = new ActionFormData();
${buttons.map(button => `    form.button("${button.text}", "${button.texture}");`).join('\n')}

    form.show(player).then(r => {
        
    })
}

world.beforeEvents.itemUse.subscribe(ev => {
    const item = ev.itemStack;
    const player = ev.source;
    
    if (item.typeId == 'minecraft:stick') {
        system.run(() => {
            showCustomForm(player);
        })
    }
})
`;

}