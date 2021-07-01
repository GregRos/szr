import {
    EncodeContext,
    SzrPrototypeEncoding,
    DecodeCreateContext,
    DecodeInitContext,
    Decoder
} from "../szr-interface";
import {getClassName, getLibraryString} from "../utils";
import {SzrLeaf, Reference} from "../szr-representation";
import {SzrError} from "../errors";

export const nullPlaceholder = {};
function getAllOwnKeys(obj: object, onlyEnumerable: boolean): PropertyKey[] {
    const keys = Reflect.ownKeys(obj);
    if (onlyEnumerable) {
        return keys.filter(x => Object.prototype.propertyIsEnumerable.call(obj, x));
    }
    return keys;
}

export function decodeObject(target, input, ctx: DecodeInitContext) {
    let stringKeys = input;
    if (Array.isArray(input)) {
        let symbolKeys;
        [stringKeys, symbolKeys] = input;
        for (const [key, value] of Object.entries(symbolKeys)) {
            target[ctx.decode(key) as symbol] = ctx.decode(value as SzrLeaf);
        }
    }
    for (const [key, value] of Object.entries(stringKeys)) {
        target[key] = ctx.decode(value as SzrLeaf);
    }
    return target;
}

export function encodeObject(input, ctx: EncodeContext, alsoNonEnumerable: boolean, explicitlyInclude = [] as string[]) {
    const strKeyObject = {};
    let symbKeyObject: Record<string, SzrLeaf> | undefined;
    for (const key of getAllOwnKeys(input, !alsoNonEnumerable)) {
        const value = input[key];
        if (typeof key === "symbol") {
            symbKeyObject ??= {};
            symbKeyObject[ctx.encode(key) as string] = ctx.encode(value);
        } else {
            strKeyObject[key] = ctx.encode(value);
        }
    }
    for (const key of explicitlyInclude) {
        if (!(key in strKeyObject) && key in input) {
            strKeyObject[key] = ctx.encode(input[key]);
        }
    }
    if (symbKeyObject) {
        return [strKeyObject, symbKeyObject];
    }
    (ctx as any)._isImplicit = true;
    return strKeyObject;
}

export const ObjectEncoding: SzrPrototypeEncoding = {
    prototypes: [Object.prototype],
    key: getLibraryString("object"),
    encode(input: any, ctx: EncodeContext): any {
        return encodeObject(input, ctx, false);
    },
    decoder: {
        create(encodedValue: any, ctx: DecodeCreateContext): any {
            return {};
        },
        init(target: any, encoded: any, ctx: DecodeInitContext) {
            decodeObject(target, encoded, ctx);
        }
    }
};

function encodeAsSparseArray(input: any, ctx: EncodeContext) {
    // Sparse arrays are serialized like objects.
    const result = encodeObject(input, ctx, false);
    (ctx as any)._isImplicit = false;
    return result;
}

export const ArrayEncoding: SzrPrototypeEncoding = {
    key: getLibraryString("array"),
    prototypes: [Array.prototype],
    encode(input: any, ctx: EncodeContext): any {
        const keys = Object.keys(input);
        let isSparseCanFalseNegative = input.length !== keys.length;
        if (isSparseCanFalseNegative) {
            return encodeAsSparseArray(input, ctx);
        }
        // The array still might be sparse, even after that check.
        const newArray = [] as any[];
        for (let i = 0; i < keys.length; i++) {
            if (i !== +keys[i]) {
                return encodeAsSparseArray(input, ctx);
            }
            newArray.push(ctx.encode(input[i]));
        }
        (ctx as any)._isImplicit = true;
        return newArray;
    },
    decoder: {
        create(encodedValue: any, ctx: DecodeCreateContext): any {
            return [];
        },
        init(target: any, input: any, ctx: DecodeInitContext) {
            if (!Array.isArray(input)) {
                // Decode similarly to objects
                decodeObject(target, input, ctx);
                return;
            }
            for (let i = 0; i < input.length; i++) {
                target[i] = ctx.decode(input[i]);
            }
        }
    }
};
export const NullPrototypeEncoding: SzrPrototypeEncoding = {
    key: getLibraryString("null"),
    encode: getPrototypeEncoder(null),
    decoder: getPrototypeDecoder(null),
    prototypes: [nullPlaceholder]
};

export function getPrototypeDecoder(proto: object | null) {
    return {
        init: ObjectEncoding.decoder.init,
        create(encodedValue: any, ctx: DecodeCreateContext): any {
            return Object.create(proto);
        }
    } as Decoder;
}

export function getPrototypeEncoder(proto: object | null) {
    return (input, ctx: EncodeContext) => {
        const result = encodeObject(input, ctx, false);
        (ctx as any)._isImplicit = false;
        return result;
    };
}

export const unsupportedEncodingKey = getLibraryString("unsupported");

export function getUnsupportedEncoding(...protos: object[]): SzrPrototypeEncoding {
    return {
        key: unsupportedEncodingKey,
        prototypes: protos,
        encode(input: any, ctx: EncodeContext): any {
            ctx.metadata = getClassName(input);
            return 0;
        },
        decoder: {
            create(encodedValue: any, ctx: DecodeCreateContext): any {
                return undefined;
            }
        }
    };
}
