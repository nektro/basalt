/**
 * https://github.com/nektro/basalt/blob/master/src/loop.js
 */
//
"use strict";
//


/**
 * @type {Loop}
 */
export class Loop {
    /**
     * @param {Number} min
     * @param {Number} max
     * @param {Number} start
     */
    constructor(min, max, start) {
        this.min = min;
        this.max = max;
        this.value = start;
    }
    inc() {
        this.value += 1;
        if (this.value > this.max) {
            this.value = this.min;
        }
    }
    dec() {
        this.value -= 1;
        if (this.value < this.min) {
            this.value = this.max;
        }
    }
}
