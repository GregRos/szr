import {
    DecodeCreateContext, DecodeInitContext,
    EncodeContext,
    SzrPrototypeEncoding
} from "../szr-interface";
import {getLibraryString} from "../utils";
import {SzrLeaf} from "../szr-representation";

export const mapEncoding: SzrPrototypeEncoding = {
    prototypes: [Map.prototype],
    key: getLibraryString("Map"),
    encode(input: Map<any, any>, ctx: EncodeContext): any {
        const array = [] as [SzrLeaf, SzrLeaf][];
        for (const key of input.keys()) {
            const value = input.get(key);
            array.push([ctx.ref(key), ctx.ref(value)]);
        }
        return array;
    },
    decoder: {
        create(encodedValue: any, ctx: DecodeCreateContext): any {
            return new Map();
        },
        init(target: Map<any, any>, encoded: [SzrLeaf, SzrLeaf][], ctx: DecodeInitContext) {
            for (const [key, value] of encoded) {
                target.set(ctx.deref(key), ctx.deref(value));
            }
        }
    }
};

export const setEncoding: SzrPrototypeEncoding = {
    prototypes: [Set.prototype],
    key: getLibraryString("Set"),
    encode(input: Set<any>, ctx: EncodeContext): any {
        const outArray = [] as SzrLeaf[];
        for (const item of input) {
            outArray.push(ctx.ref(item));
        }
        return outArray;
    },
    decoder: {
        create(encodedValue: any, ctx: DecodeCreateContext): any {
            return new Set();
        },
        init(target: Set<any>, encoded: SzrLeaf[], ctx: DecodeInitContext) {
            for (const item of encoded) {
                target.add(ctx.deref(item));
            }
        }
    }
};
