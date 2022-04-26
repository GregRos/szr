import { SimpleEncodingSpecifier } from "./interface";

let packageObj;
try {
    packageObj = require("../../package.json");
} catch (err) {
    packageObj = require("./package.json");
}

export function cloneDeep<T>(source: T): T {
    if (typeof source !== "object") {
        return source;
    }
    if (Array.isArray(source)) {
        return source.map(x => cloneDeep(x)) as any;
    }
    const newObj = Object.create(Object.getPrototypeOf(source));
    for (const key of Object.keys(source)) {
        newObj[key] = cloneDeep((source as any)[key]);
    }
    return newObj;
}

// Based on lodash's implementation: https://github.com/lodash/lodash
function _defaultsDeep(target: any, source: any) {
    target = Object(target);
    if (!source) return target;
    source = Object(source);
    for (const key of Object.keys(source)) {
        const value = source[key];
        if (typeof target[key] === "object") {
            defaultsDeep(target[key], Object(value));
        } else {
            if (target[key] === undefined) {
                target[key] = value;
            }
        }
    }
    return target;
}

export function maxBy<T>(target: T[], projection: (x: T, n: number) => number) {
    if (target.length === 0) {
        return undefined;
    }
    let maxProjected = projection(target[0], 0);
    let maxIndex = 0;
    for (let i = 1; i < target.length; i++) {
        const curProjected = projection(target[i], i);
        if (curProjected > maxProjected) {
            maxProjected = curProjected;
            maxIndex = i;
        }
    }
    return target[maxIndex];
}

export function defaultsDeep(target: any, ...sources: any[]) {
    for (const source of sources) {
        target = _defaultsDeep(target, source);
    }
    return target;
}

export function flatten<T>(arrs: T[][]) {
    return ([] as T[]).concat(...arrs);
}

export function isNumericString(input: string) {
    return +input === parseInt(input);
}

export function getBuiltInEncodingName(str: string) {
    return `${str}`;
}

export function getImplicitClassEncodingName(str: string) {
    return str;
}

export function getClassName(proto: any): string | null | undefined {
    return proto[Symbol.toStringTag] ?? proto.constructor?.name;
}

export function getSymbolName(symb: symbol) {
    return symb.toString().slice(7, -1);
}

export function getUnrecognizedSymbolName(name: string) {
    return `preszr unknown: ${name}`;
}

export function getUnrecognizedSymbol(name: string) {
    return Symbol(getUnrecognizedSymbolName(name));
}

export function isSimpleEncodingSpec(
    candidate: unknown
): candidate is SimpleEncodingSpecifier {
    return typeof candidate === "symbol" || typeof candidate === "function";
}

export const version = packageObj.version.split(".")[0];
