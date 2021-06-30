import test, {Implementation, UntitledMacro} from "ava";
import {decode, encode} from "../lib";
import {createSzrRep, createWithTitle, embedSzrVersion, testDecodeMacro, testEncodeMacro} from "./utils";
import {objectEncoding, unsupportedEncodingKey} from "../lib/encodings/basic";
import {unrecognizedSymbolKey} from "../lib/szr-representation";
import {getImplicitSymbolEncodingName, getLibraryString, getSymbolName, getUnrecognizedSymbol, getUnrecognizedSymbolName} from "../lib/utils";
import {Szr} from "../lib/szr";

const testSymbol = Symbol("test");
const testSymbol2 = Symbol("test");
const testSymbol3 = Symbol("test");
const unrecognizedSymbolMacro = (decodeImpl: UntitledMacro<[any]>) => {
    return [
        createWithTitle(testEncodeMacro, (decoded, encoded) => [decoded, embedSzrVersion(encoded)], title => `encode :: ${title}`),
        createWithTitle(decodeImpl, (decoded, encoded) => [embedSzrVersion(encoded)], title => `decode :: ${title}`)
    ] as [any, any];
};

test("library string function", t => {
    t.is(getLibraryString("a"), "!@#szr-a");
});

test("unrecognized symbol name generator", t => {
    t.is(getSymbolName(getUnrecognizedSymbol("x")), "szr unknown: x");
});

test("unrecognized symbol input", unrecognizedSymbolMacro((t, encoded) => {
    const decoded = decode(encoded);
    t.is(typeof decoded, "symbol");
    t.is(decoded.description, getUnrecognizedSymbolName("test"));
}), testSymbol, [[{1: unrecognizedSymbolKey}, {1: "test"}], 0]);

test("unrecognized symbol no name", unrecognizedSymbolMacro((t, encoded) => {
    const decoded = decode(encoded);
    t.is(typeof decoded, "symbol");
    t.is(getSymbolName(decoded as any), getUnrecognizedSymbolName("#1"));
}), Symbol(), [[{1: unrecognizedSymbolKey}, {1: "#1"}], 0]);

test("unrecognized symbol property value", unrecognizedSymbolMacro((t, encoded) => {
    const decoded = decode(encoded);
    t.is(typeof decoded.a, "symbol");
    t.is(decoded.a.description, getUnrecognizedSymbolName("test"));
}), {a: testSymbol}, [[{2: unrecognizedSymbolKey}, {2: "test"}], {a: "2"}, 0]);

test("two unrecognized symbol values", unrecognizedSymbolMacro((t, encoded) => {
    const decoded = decode(encoded);
    t.is(typeof decoded.a, "symbol");
    t.is(decoded.a.description, getUnrecognizedSymbolName("test"));
}), {a: testSymbol, b: testSymbol2}, [[{2: unrecognizedSymbolKey, 3: unrecognizedSymbolKey}, {2: "test", 3: "test"}], {a: "2", b: "3"}, 0, 0]);

test("unrecognized symbol key", unrecognizedSymbolMacro((t, encoded) => {
    const decoded = decode(encoded);
    const [key] = Reflect.ownKeys(decoded);
    t.is(typeof key, "symbol");
    t.is((key as any).description, getUnrecognizedSymbolName("test"));
    t.is(decoded[key], 1);
}), {[testSymbol]: 1}, [[{1: objectEncoding.key, 2: unrecognizedSymbolKey}, {2: "test"}], [{}, {2: 1}], 0]);


test("two different unrecognized symbol properties", unrecognizedSymbolMacro((t, encoded) => {
    const decoded = decode(encoded);
    const [key1, key2] = Reflect.ownKeys(decoded);
    t.is(typeof key1, "symbol");
    t.is(typeof key2, "symbol");
    t.not(key1, key2);
    t.is(getSymbolName(key1 as any), getUnrecognizedSymbolName("test"));
    t.is(getSymbolName(key2 as any), getUnrecognizedSymbolName("test"));
}), {[testSymbol]: 1, [testSymbol2]: 2}, [
    [{1: objectEncoding.key, 2: unrecognizedSymbolKey, 3: unrecognizedSymbolKey}, {2: "test", 3: "test"}],
    [{}, {2: 1, 3: 2}], 0, 0
]);

test("deep equal works symbol values and keys", t => {
    const o = () => {
        return {[Symbol("a")]: 1};
    };
    t.notDeepEqual(o(), o());
    const z = o();
    t.deepEqual(z, z);
    const justValues = () => {
        return {
            a: Symbol("a")
        };
    };
    t.notDeepEqual(justValues(), justValues());
});

const szrWithSymbol = new Szr({
    encodings: [
        testSymbol,
        {
            symbol: testSymbol2,
            key: "test2"
        }
    ]
});

const recognizedSymbolMacro = [
    createWithTitle(testEncodeMacro, (decoded, encoded) => [decoded, embedSzrVersion(encoded), szrWithSymbol], title => `encode :: ${title}`),
    createWithTitle(testDecodeMacro, (decoded, encoded) => [decoded, embedSzrVersion(encoded), szrWithSymbol], title => `decode :: ${title}`)
] as [any, any];

test("recognized symbol", recognizedSymbolMacro, testSymbol,
    [[{1: getImplicitSymbolEncodingName("test")}, {}], 0],
    szrWithSymbol
);

test("encode+decode :: one recognized symbol, one not", t => {
    const encoded = szrWithSymbol.encode({
        a: testSymbol,
        b: testSymbol3
    });
    t.deepEqual(
        encoded,
        embedSzrVersion([
            [{2: getImplicitSymbolEncodingName("test"), 3: unrecognizedSymbolKey}, {3: "test"}],
            {a: "2", b: "3"}, 0, 0
        ]));
    const result = szrWithSymbol.decode(encoded);
    const {a, b} = result;
    t.is(a, testSymbol);
    t.is(getSymbolName(b as any), getUnrecognizedSymbolName("test"));
});

test("two recognized symbols", recognizedSymbolMacro,
    {a: testSymbol, b: testSymbol2},
    [[{2: getImplicitSymbolEncodingName("test"), 3: "test2"}, {}], {a: "2", b: "3"}, 0, 0]
);

// TODO: built-in symbols