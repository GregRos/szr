import {
    DecodeCreateContext,
    DecodeInitContext,
    EncodeContext,
    PreszrPrototypeEncoding,
} from "../interface";
import { getLibraryString } from "../utils";

export const regexpEncoding: PreszrPrototypeEncoding = {
    prototypes: [RegExp.prototype],
    key: getLibraryString("RegExp"),
    encode({ source, flags }: RegExp, ctx: EncodeContext): any {
        return flags ? [source, flags] : source;
    },
    decoder: {
        create(input: string | string[], ctx: DecodeInitContext) {
            if (typeof input === "string") {
                return new RegExp(input);
            } else {
                return new RegExp(input[0], input[1]);
            }
        },
    },
};
export const dateEncoding: PreszrPrototypeEncoding = {
    prototypes: [Date.prototype],
    key: getLibraryString("Date"),
    encode(input: Date, ctx: EncodeContext): any {
        return input.getTime();
    },
    decoder: {
        create(encodedValue: number, ctx: DecodeCreateContext): any {
            return new Date(encodedValue);
        },
    },
};

export function createFundamentalObjectEncoding(ctor: {
    new (x): any;
}): PreszrPrototypeEncoding {
    return {
        key: getLibraryString(ctor.name),
        prototypes: [ctor.prototype],
        encode(input: any, ctx: EncodeContext): any {
            return input.valueOf();
        },
        decoder: {
            create(encodedValue: any, ctx: DecodeCreateContext): any {
                return new ctor(encodedValue);
            },
        },
    };
}
