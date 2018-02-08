//
'use strict';


const decoder = new TextDecoder();

/**
 * @param {Blob} blob
 * @returns {Promise<Response>}
 */
export async function read(blob) {
    const reader = new FileReader();
    return new Promise(function(resolve, reject) {
        reader.addEventListener('load', function(e) {
            resolve(new Response(e.target.result));
        });
        reader.readAsArrayBuffer(blob);
    });
}
