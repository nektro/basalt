/**
 * https://github.com/nektro/basalt/blob/master/src/switch.js
 */
//
"use strict";
//
export default class Switch {
    constructor() {
        this._cases = new Map();
        this._blocks = new Array();
        this._def = null;
    }
    case(ca, cb) {
        for (const c of ca) {
            this._cases.set(c, this._blocks.length);
        }
        this._blocks.push(cb);
    }
    default(cb) {
        this._def = cb;
    }
    run(arg, ...extras) {
        if (this._cases.has(arg)) {
            return this._blocks[this._cases.get(arg)](arg, ...extras);
        }
        else
        if (this._def !== null) {
            return this._def(arg, ...extras);
        }
    }
}
