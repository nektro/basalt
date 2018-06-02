//
"use strict";


/**
 * @type {Loop}
 */
export class Loop {
    /**
     * @param {Integer} min
     * @param {Integer} max
     * @param {Integer} start
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
