/* jshint esversion:6 */

const decoder = new TextDecoder();

/**
 * @param {Blob} blob
 * @returns {Promise<ReadBody>}
 */
export function read(blob) {
    const reader = new FileReader();
    return new Promise(function(resolve, reject) {
        reader.addEventListener('load', function(e) {
            resolve(new ReadBody(e.target.result));
        });
        reader.readAsArrayBuffer(blob);
    });
}

export class ReadBody {
    /**
     * @param {ArrayBuffer} ab
     */
    constructor(ab) {
        /** @constant */
        this.buffer = ab;
    }
    /** @returns {Promise<ArrayBuffer>} */
    async arrayBuffer() {
        return this.buffer;
    }
    /** @returns {Promise<Blob>} */
    async blob() {
        return new Blob([this.buffer]);
    }
    /** @returns {Promise<Object>} */
    async json() {
        return JSON.parse(await this.text());
    }
    /** @returns {Promise<String>} */
    async text() {
        return decoder.decode(this.buffer);
    }
}
