import { JsonUISimpleElement } from "./HTMLClassToJonUITypes";

export const JSON_TYPES: Map<string, JsonUISimpleElement> = new Map([
    [
        "buttonWithHoverText",
        {
            "$default_button_background_texture|default": "textures/ui/glass_pane",
            "$hover_button_background_texture|default": "textures/ui/glass_pane_hover",
            "$pressed_button_background_texture|default": "textures/ui/button_black_hover",
            "$button_size|default": [64, 64],
            "$icon_size|default": [45, 45],
            "$text_offset|default": [0, -8],
            "$font_size|default": 1,
            "$offset_test|default": [0, 0],
            "$icon_offset|default": [0, -5],
            "$hover_text|default": true,
            "$show_text|default": "yes",
            "$binding_name_condition|default": "",
            type: "panel",
            size: "$button_size",
            anchor_from: "top_left",
            anchor_to: "top_left",
            controls: [
                {
                    panel_name: {
                        type: "panel",
                        size: "$button_size",
                        offset: "$offset_test",
                        anchor_from: "top_left",
                        anchor_to: "top_left",
                        bindings: [
                            {
                                binding_type: "view",
                                source_control_name: "image",
                                resolve_sibling_scope: true,
                                source_property_name: "(not (#texture = ''))",
                                target_property_name: "#visible",
                            },
                        ],
                        controls: [
                            {
                                image: {
                                    anchor_from: "top_left",
                                    anchor_to: "top_left",
                                    type: "image",
                                    layer: 200,
                                    size: "$icon_size",
                                    offset: "$icon_offset",
                                    bindings: [
                                        {
                                            binding_name: "#form_button_texture",
                                            binding_name_override: "#texture",
                                            binding_type: "collection",
                                            binding_collection_name: "form_buttons",
                                        },
                                        {
                                            binding_name: "#form_button_texture_file_system",
                                            binding_name_override: "#texture_file_system",
                                            binding_type: "collection",
                                            binding_collection_name: "form_buttons",
                                        },
                                        {
                                            binding_type: "view",
                                            source_property_name: "(not ((#texture = '') or (#texture = 'loading')))",
                                            target_property_name: "#visible",
                                        },
                                    ],
                                },
                            },
                            {
                                text: {
                                    anchor_from: "top_left",
                                    anchor_to: "top_left",
                                    type: "label",
                                    text: "#form_button_text",
                                    font_scale_factor: "$font_size",
                                    layer: 5,
                                    shadow: true,
                                    offset: "$text_offset",
                                    bindings: [
                                        {
                                            binding_name: "#form_button_text",
                                            binding_type: "collection",
                                            binding_collection_name: "form_buttons",
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
                {
                    "form_button@common_buttons.light_content_button": {
                        $default_button_texture: "$default_button_background_texture",
                        $hover_button_texture: "$hover_button_background_texture",
                        $pressed_button_texture: "$pressed_button_background_texture",
                        $default_state_border_visible: false,
                        $hover_state_border_visible: false,
                        $pressed_state_border_visible: false,
                        $pressed_button_name: "button.form_button_click",
                        offset: "$offset_test",
                        anchor_from: "top_left",
                        anchor_to: "top_left",
                        size: "$button_size",
                        $button_text: "#null",
                        $button_text_binding_type: "collection",
                        $button_text_grid_collection_name: "form_buttons",
                        $button_text_max_size: ["100%", 20],
                        variables: [
                            {
                                requires: "($hover_text)",
                                $button_content: "main.hover_text_panel",
                            },
                        ],
                        bindings: [
                            {
                                binding_type: "collection_details",
                                binding_collection_name: "form_buttons",
                            },
                        ],
                    },
                },
            ],
            bindings: [
                {
                    binding_name: "#form_button_text",
                    binding_type: "collection",
                    binding_collection_name: "form_buttons",
                },
                {
                    binding_type: "view",
                    source_property_name: "(not (#form_button_text = '') )",
                    target_property_name: "#visible",
                },
            ],
        },
    ],
    [
        'basicPanelScrollingContent',
        {
            type: 'panel',
            size: ['100%', '100%c'],
            anchor_from: 'top_left',
            anchor_to: 'top_left',
            controls: [
                
            ]
        }
    ]
]);
