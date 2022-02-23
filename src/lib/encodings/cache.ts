import { PrototypeEncoding, SymbolEncoding } from "../interface";
import { PreszrError } from "../errors";
import { getSymbolName, maxBy } from "../utils";
import { nullPlaceholder } from "./basic";
import { unrecognizedSymbolKey } from "../data";
import { EncodingStore } from "./encoding-store";

export class WorkingEncodingCache {
    // Quickly matches a prototype to an encoding. Weak map to avoid memory leaks.
    // Used and updated during operation, and needs to be rebuilt whenever encodings are added.
    // This will have the protos referenced by encodings, and also their descendants.
    // whenever the proto encoding list is updated, this becomes outdated.
    private _cacheProtoToEncoding: WeakMap<object, PrototypeEncoding>;

    // Mirrors this._symbolToEncoding but includes unknown symbol mappings.
    private _cacheSymbolToEncoding: Map<symbol, SymbolEncoding>;

    private _unknownSymbolCount = 0;

    constructor(private _encodings: EncodingStore) {
        this._cacheProtoToEncoding = this._makeWorkingProtoCache();
        this._cacheSymbolToEncoding = this._makeWorkingSymbolCache();
    }

    private _makeWorkingProtoCache() {
        // We add an entry to the working encoding cache for every registered
        // encoding.
        const cache = new WeakMap<object, PrototypeEncoding>();
        for (const encoding of this._encodings.getProtoEncodings()) {
            if (!(encoding as any)) {
                throw new Error(
                    `Invariant failed - expected there to be a maximum version encoding for ${encoding.name}.`
                );
            }
            for (const proto of encoding.prototypes) {
                cache.set(proto, encoding);
            }
        }
        return cache;
    }

    private _makeWorkingSymbolCache() {
        const cache = new Map<symbol, SymbolEncoding>();
        for (const encoding of this._encodings.getSymbolEncodings()) {
            cache.set(encoding.symbol, encoding);
        }
        return cache;
    }

    mustGetBySymbol(sym: symbol) {
        const found = this._cacheSymbolToEncoding.get(sym);
        if (!found) {
            this._unknownSymbolCount++;
            const dummy = {
                symbol: sym,
                name: unrecognizedSymbolKey,
                metadata: getSymbolName(sym) || `#${this._unknownSymbolCount}`
            };
            this._cacheSymbolToEncoding.set(sym, dummy);
        } else {
            return found;
        }
    }

    mustGetByProto(obj: object) {
        const fromCache = this._cacheProtoToEncoding.get(obj);
        if (fromCache) {
            return fromCache;
        }
        let foundEncoding: PrototypeEncoding;
        const chain = [] as object[];
        for (let proto = obj; ; proto = Object.getPrototypeOf(proto) ?? nullPlaceholder) {
            chain.push(proto);
            const cached = this._cacheProtoToEncoding.get(proto);
            if (cached !== undefined) {
                foundEncoding = cached;
                break;
            }
            if (proto === nullPlaceholder) {
                throw new PreszrError("Invariant failed - mustGetByProto failed to find anything.");
            }
        }
        for (const proto of chain) {
            this._cacheProtoToEncoding.set(proto, foundEncoding);
        }
        return foundEncoding;
    }
}
