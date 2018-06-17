/**
 * https://nektro.github.io/basalt/src/read.js
 */
//
"use strict";
//


/**
 * @param {Blob} blob
 * @returns {Promise<Response>}
 */
export async function read(blob) {
    const reader = new FileReader();
    return new Promise(function(resolve) {
        reader.addEventListener("load", function(e) {
            resolve(new Response(e.target.result));
        });
        reader.readAsArrayBuffer(blob);
    });
}
