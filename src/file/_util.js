/**
 * https://github.com/nektro/basalt/blob/master/src/file/_util.js
 */
//
"use strict";
//
import { pipe } from "../pipe.js";

//
export const arr_toChars = (a) => Array.from(a).map(x => pipe(x, String.fromCharCode));
export const arr_join = (a) => a.join("");
export const arr_sum = (a) => a.reduce((ac,cv) => ac + cv, 0);

export const ta_toDV = (a) => new DataView(a.buffer);
export const ta_matches = (t) => (a) => a.every((v,i) => v === t[i]);

export const dv_gUi8  = (le=false) => (a) => a.getUint8(0, le);
export const dv_gUi16 = (le=false) => (a) => a.getUint16(0, le);
export const dv_gUi32 = (le=false) => (a) => a.getUint32(0, le);

//
const _fix = (a) => ( a.p |= 0, a );
export const _read_raw      = (l) => (a) => pipe(a, _fix, (x) => x.slice(x.p, x.p+=l));
export const _read_string   = (l) => (a) => pipe(a, _read_raw(l), arr_toChars, arr_join);
export const _read_Uint8    =        (a) => pipe(a, _read_raw(1), ta_toDV, dv_gUi8());
export const _read_Uint16   =        (a) => pipe(a, _read_raw(2), ta_toDV, dv_gUi16());
export const _read_Uint32   =        (a) => pipe(a, _read_raw(4), ta_toDV, dv_gUi32());
export const _read_Uint16le =        (a) => pipe(a, _read_raw(2), ta_toDV, dv_gUi16(true));

//
export const _find_Uint8 = (b) => (a) => a.slice(a.p).findIndex(v => v === b);

//
export const _peek_Uint8 = (a) => a.slice(a.p,a.p+1)[0];
