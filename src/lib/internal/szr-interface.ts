import {SzrEncodedEntity, SzrLeaf} from "./szr-representation";


/**
 * The context used by the encoding process.
 */
export interface EncodeContext {
    /**
     * Encodes the given input. For entities, it will recursively encode them, add
     * them to the final output as a side-effect, and return a reference. For other
     * values, it will return them as-is or encode them, usually as a string.
     * @param value
     */
    encode(value: any): SzrLeaf;
    /**
     * Sets the metadata for this entity. The metadata can be any JSON-legal value,
     * including an object. It doesn't do anything, but can be accessed while decoding.
     */
    metadata: any;
}

/**
 * The context used by the create stage of the decoding process. Only
 * exposes the entity's metadata.
 */
export interface DecodeCreateContext {
    // The metadata for this encoded entity.
    metadata: any;
}

/**
 * The context used by the init stage of the decoding process. Allows
 * resolving references to other entities.
 */
export interface DecodeInitContext extends DecodeCreateContext {
    // Resolves references and decodes encoded scalars. This isn't a recursive call.
    decode(value: SzrLeaf): any;
}

/**
 * The decoding logic for a prototype encoding.
 */
export interface Decoder {
    // Creates an instance of the entity without referencing any other encoded entities.
    create(encoded: SzrEncodedEntity, ctx: DecodeCreateContext): any;
    // Fills in additional data by resolving references to other entities.
    init?(target: any, encoded: SzrEncodedEntity, ctx: DecodeInitContext): void;
}

/**
 * Specifies a prototype encoding. Missing fields will be filled in automatically.
 */
export interface SzrPrototypeSpecifier {
    // The key of the encoding. Must be unique. Will be inferred from the prototype if missing.
    key?: string;
    // The prototype. Required.
    prototype: object | null;
    // The decoding logic. If missing, the default decoding will be used, which will fill in
    // the object's properties and attach the correct prototype.
    decoder?: Decoder;
    // The encoding logic. If missing, the default encode function will be used, which
    // will iterate over the object's own enumerable properties and recursively encode them.
    encode?(input: any, ctx: EncodeContext): SzrEncodedEntity;
}

/**
 * A full symbol encoding. Mainly for internal use.
 */
export interface SzrSymbolEncoding {
    key: string;
    symbol: symbol;
    metadata?: any;
}


/**
 * A full prototype encoding. Mainly for internal use.
 */
export interface SzrPrototypeEncoding {
    key: string;
    prototypes: object[];
    decoder: Decoder;
    encode(input: any, ctx: EncodeContext): any;
}

/**
 * A full szr encoding. Mainly for internal use.
 */
export type SzrEncoding = SzrPrototypeEncoding | SzrSymbolEncoding;

/**
 * An encoding specifier. Can be a symbol or constructor for a shorthand
 * symbol or prototype encoding. You can also give symbol or prototype encoding specifier
 * if you want to be more explicit.
 */
export type SzrEncodingSpecifier = symbol | Function | SzrPrototypeSpecifier | SzrPrototypeEncoding | SzrSymbolEncoding;

export interface SzrConfig {
    /**
     * An array of encoding specifiers. If you put your constructors and symbols here,
     * the Szr will recognize them.
     */
    encodings: SzrEncodingSpecifier[];
    unsupported: Function[];
}

export type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
};

