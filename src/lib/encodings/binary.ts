import {
    DecodeCreateContext,
    EncodeContext,
    PreszrPrototypeEncoding,
} from "../interface";
import { getLibraryString } from "../utils";
import { fromByteArray, toByteArray } from "base64-js";

/**
 * A union of all typed array constructors.
 */
export type TypedArrayConstructor =
    | Int8ArrayConstructor
    | Int16ArrayConstructor
    | Int32ArrayConstructor
    | Uint8ArrayConstructor
    | Uint16ArrayConstructor
    | Uint32ArrayConstructor
    | Uint8ClampedArrayConstructor
    | Float32ArrayConstructor
    | Float64ArrayConstructor
    | DataViewConstructor;

export const arrayBufferEncoding: PreszrPrototypeEncoding = {
    key: getLibraryString("ArrayBuffer"),
    prototypes: [ArrayBuffer.prototype],
    encode(input: ArrayBuffer, ctx: EncodeContext): any {
        const b64 = fromByteArray(new Uint8Array(input));
        return b64;
    },
    decoder: {
        create(encodedValue: string, ctx: DecodeCreateContext): any {
            const byteArray = toByteArray(encodedValue);
            return byteArray.buffer;
        },
    },
};

export function createTypedArrayEncoding(
    ctor: TypedArrayConstructor
): PreszrPrototypeEncoding {
    return {
        key: getLibraryString(ctor.name),
        prototypes: [ctor.prototype],
        encode(
            input: InstanceType<TypedArrayConstructor>,
            ctx: EncodeContext
        ): any {
            return arrayBufferEncoding.encode(input.buffer, ctx);
        },
        decoder: {
            create(encodedValue: any, ctx: DecodeCreateContext): any {
                const buffer = arrayBufferEncoding.decoder.create(
                    encodedValue,
                    ctx
                ) as ArrayBuffer;
                return new ctor(buffer);
            },
        },
    };
}

export const typedArrayCtors = [
    Uint8Array,
    Uint16Array,
    Uint32Array,
    Uint8ClampedArray,
    Int8Array,
    Int16Array,
    Int32Array,
    Float32Array,
    Float64Array,
    DataView,
];

export const typedArrayEncodings = typedArrayCtors.map(
    createTypedArrayEncoding
);
