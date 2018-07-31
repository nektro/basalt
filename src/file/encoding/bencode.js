/**
 * https://github.com/nektro/basalt/blob/master/src/file/encoding/bencode.js
 */
"use strict";
/**
 * Bencode (B-encode) is the encoding used by BitTorrent for storing and transmitting loosely structured data.
 * @see https://en.wikipedia.org/wiki/Bencode
 */
//
import { pipe } from "./../../pipe.js";
import { _fix, _peek_Uint8, _read_Uint8, _find_Uint8, _read_string } from "../_util.js";

//
const code_colon = 0x3a;
const code_D = 0x64;
const code_E = 0x65;
const code_I = 0x69;
const code_L = 0x6C;

//
export function decode(ui8a) {
    return pipe(ui8a, pipe(ui8a, _fix, _peek_Uint8, get_type_from_byte));
}
function read_dictionary(ui8a) {
    console.assert(pipe(ui8a, _read_Uint8) === code_D, "Dictionary must start with \"d\"!");
    const dict = new Map();
    while (pipe(ui8a, _peek_Uint8) !== code_E) {
        const [k, v] = pipe(ui8a, read_dictionary_kv);
        dict.set(k, v);
    }
    pipe(ui8a, _read_Uint8); // read the "e"
    return dict;
}
function read_dictionary_kv(ui8a) {
    let key = (pipe(ui8a, read_string));
    let ty_f = (pipe(ui8a, _peek_Uint8, get_type_from_byte));
    let value = (pipe(ui8a, ty_f));
    return [key, value];
}
function get_type_from_byte(i) {
    if (i >= 0x30 && i <= 0x39) return read_string;
    if (i === code_I) return read_integer;
    if (i === code_L) return read_list;
    if (i === code_D) return read_dictionary;
    throw new Error(`unknown type "${i}"`);
}
function read_string(ui8a) {
    let a = pipe(ui8a, _find_Uint8(code_colon));
    let b = pipe(ui8a, _read_string(a), parseInt);
    (pipe(ui8a, _read_Uint8)); // read the ":"
    return pipe(ui8a, _read_string(b));
}
function read_list(ui8a) {
    console.assert(pipe(ui8a, _read_Uint8) === code_L, "List must start with \"l\"!");
    const retv = new Array();
    while (pipe(ui8a, _peek_Uint8) !== code_E) {
        retv.push(pipe(ui8a, read_list_v));
    }
    pipe(ui8a, _read_Uint8); // read the "e"
    return retv;
}
function read_list_v(ui8a) {
    let ty_f = (pipe(ui8a, _peek_Uint8, get_type_from_byte));
    return (pipe(ui8a, ty_f));
}
function read_integer(ui8a) {
    console.assert(pipe(ui8a, _read_Uint8) === code_I, "Integer must start with \"i\"!");
    const len = (pipe(ui8a, _find_Uint8(code_E)));
    const int = (pipe(ui8a, _read_string(len), parseInt));
    pipe(ui8a, _read_Uint8); // read the "e";
    return int;
}

//
export function encode(obj) {
    if (obj instanceof Map) {
        return `d${[...obj].reduce((ac,cv) => ac + encode(cv[0]) + encode(cv[1]), "")}e`;
    }
    if (obj instanceof Array) {
        return `l${[...obj].reduce((ac,cv) => ac + encode(cv), "")}e`;
    }
    if (typeof obj === "number") {
        return `i${obj}e`;
    }
    if (typeof obj === "string") {
        return `${obj.length}:${obj}`;
    }
}
