import { Binding } from "./types"

export const binding_keys = [
    "binding_name",
    "binding_type",
    "binding_name_override",
    "binding_collection_name",
    "source_control_name",
    "resolve_sibling_scope",
    "source_property_name",
    "target_property_name"
] as const satisfies (keyof Binding)[];
