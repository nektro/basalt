//
'use strict';


export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * @param  {Array<Number>} array
 * @return {String}
 */
export function encode(array) {
    const bin_str = array.reduce((a,v) => a + v.toString(2).padStart(8, '0'), '');
    const pl = (Math.ceil(bin_str.length / 6.0) * 6 - bin_str.length);
    const ps = "".padEnd(pl/2, '=');
    return bin_str.padEnd(bin_str.length + pl, '0').match(/[01]{6}/g).map(x => ALPHABET[parseInt(x, 2)]).join('') + ps;
}

/**
 * @param {String} string 
 * @return {Uint8Array}
 */
export function decode(string) {
    return Uint8Array.from(string.split('=').reduce((a,v,i) => {
        return a + (i == 0 ? v.split('').reduce((b,w,j) => {
            return b + ALPHABET.indexOf(w).toString(2).padStart(6, '0');
        }, '') : '00');
    }, '')
    .match(/[01]{8}/g)
    .map(x => parseInt(x,2)));
}
