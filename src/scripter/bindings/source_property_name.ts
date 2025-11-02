import { GLOBAL_ELEMENT_MAP } from "../../index.js";
import { GeneralUtil } from "../../util/generalUtil.js";

const hardcoded_source_property_names = [
    "#null",
    "#title_text",
    "#collection_index",
    "#form_button_length",
    "#collection_length",
    "#form_button_texture_file_system",
    "#form_button_texture",
    "#form_button_text",
    "#form_text",
];

export function collectSourcePropertyNames() {
    const source_property_names = [...hardcoded_source_property_names];

    for (let element of GLOBAL_ELEMENT_MAP.values()) {
        const bindings = GeneralUtil.tryParseBindings(element.bindings) ?? [];
        if (bindings.length == 0) continue;

        const isIterable = GeneralUtil.isIterable(bindings);
        console.log("(source_property_name.ts) - Is Iterable", isIterable);
        if (!isIterable) continue;

        for (let binding of bindings) {
            if (binding.target_property_name) {
                if (!source_property_names.includes(binding.target_property_name)) {
                    source_property_names.push(binding.target_property_name);
                }
            }
        }
    }

    return source_property_names;
}
