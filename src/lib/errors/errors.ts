/* prettier-ignore */
export const enum ParseError {
    config__fixed_index_collision = 0x01F,
    message__not_array = 0x01F,
    message__no_header = 0x02F,
    message__header_not_array = 0x03F,
    message__length_less_than_2 = 0x07F,
    message__header_empty = 0x0AF,
    message__header_version_not_string = 0x0BF,
    header__no_key_list = 0x10F,
    header__key_list_not_array = 0x11F,
    header__key_not_string = 0x12F,
    header__key_unknown_format = 0x13F,
    header__key_duplicate = 0x14F,
    header__no_encoding_map = 0x20F,
    header__encoding_map_not_object = 0x21F,
    header__encoding_map_key_not_reference = 0x24F,
    header__encoding_map_value_not_string = 0x25F,
    header__encoding_map_value_not_index = 0x20F,
    header__encoding_map_key_out_of_bounds = 0x2AF,
    header__encoding_map_index_out_of_bounds = 0x2BF,
    header__encoding_map_index_reserved = 0x2CF, 
    header__no_metadata = 0x30F,
    header__metadata_not_object = 0x31DF,
    header__metadata_key_not_reference = 0x36F,
    header__metadata_key_out_of_bounds = 0x3aF,

    header__no_root_reference = 0x40F,
    header__root_reference_not_integer = 0x41F,
    header__root_reference_out_of_bounds = 0x40F,
    header__extra_elements = 0x50F,
    input__unknown_string = 0x10F,
    input__invalid_type = 0x11F
}