import {EncodeContext, SzrPrototypeEncoding} from "../szr-interface";
import {getEncodedString} from "../utils";
import {objectEncoding} from "./basic";

export function createErrorEncoding(errorCtor: {new(): Error}) {
    return {
        prototype: errorCtor.prototype,
        key: getEncodedString(errorCtor.name),
        encode(input: any, ctx: EncodeContext): any {
            const encodedAsObject = objectEncoding.encode(input, ctx);
            let insertStackTarget = encodedAsObject;
            if (Array.isArray(encodedAsObject)) {
                insertStackTarget = encodedAsObject[1];
            }
            insertStackTarget.stack = ctx.ref(input.stack);
            return encodedAsObject;
        }
    } as SzrPrototypeEncoding;
}

export const errorEncodings = [
    Error,
    EvalError,
    RangeError,
    ReferenceError,
    TypeError,
    URIError,
    SyntaxError
].map(createErrorEncoding);
