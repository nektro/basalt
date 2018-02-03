//
'use strict';

import { Transform } from "./stream.js";
import { TokenType } from "./lex.js";


/**
 * @type {Expression}
 */
export class Expression {
    /**
     * @param {String} t
     * @param {Integer} l
     * @param {Integer} p
     */
    constructor(t, l, p) {
        this.type = t;
        this.line = l;
        this.pos = p;
    }
}

/**
 * @type {ExpressionSimple<T>}
 */
export class ExpressionSimple extends Expression {
    /**
     * @param {String} n
     * @param {Integer} l
     * @param {Integer} p
     * @param {<T>} v
     */
    constructor(n, l, p, v) {
        super(n, l, p);
        this.value = v;
    }
}

/**
 * @type {ExpressionContainer}
 */
export class ExpressionContainer extends Expression {
    constructor(n, a, l, p) {
        super(n, a.length > 0 ? a[0].line : l, a.length > 0 ? a[0].pos : p);
        this.value = a;
    }
}

/**
 * @type {ParserParseRule}
 */
export class ParserParseRule {
    constructor(ks, os) {
        this.keys = ks;
        this.onSuccess = os;
    }
}

/**
 * @type {Parser}
 */
export class Parser {
    constructor(hasFloats) {
        this.rules = new Array();
        this.hasFloats = hasFloats || false;
    }
    /**
     * @param {ParserParseRule} arr
     * @param {Function<Array<Expression>,Integer>} cb
     */
    addRule(arr, cb) {
        this.rules.push(new ParserParseRule(arr, cb));
    }
    /**
     * @return {Boolean}
     */
    isValidIdentifier() {
        return false;
    }
    /**
     *
     * @param  {Character} v
     * @param  {Integer} l
     * @param  {Integer} p
     */
    throwError(v, l, p) {
        console.error(`ParserError: Invalid identifier '${v}' @ ${l}:${p}`);
        return;
    }
    stream_token_to_expression() {
        const that = this;
        return new (class extends Transform {
            read(data, done) {
                if (done) {
                    return this.write(data, done);
                }
                else {
                    switch (data.type) {
                        case TokenType.Keyword: return this.write(new ExpressionSimple("Key_" + data.value, data.line, data.pos, ""), false);
                        case TokenType.Symbol:  return this.write(new ExpressionSimple("Sym_" + data.value, data.line, data.pos, ""), false);
                        case TokenType.String:  return this.write(new ExpressionSimple("String", data.line, data.pos, data.value), false);
                        case TokenType.Word: {
                            if (that.isValidIdentifier(data.value)) return this.write(new ExpressionSimple("Identifier", data.line, data.pos, data.value), false);
                            if ((new RegExp('/^([0-9]+)$/')).test(data.value))    return this.write(new ExpressionSimple("Integer", data.line, data.pos, parseInt(data.value)), false);
                            that.throwError(data.value, data.line, data.pos);
                        }
                    }
                }
            }
        })();
    }
    stream_find_decimals() {
        return new (class extends Transform {
            constructor() {
                super();
                this.temp1 = null;
                this.temp2 = null;
            }
            read(data, done) {
                if (done) {
                    return this.write(data, done);
                }
                else {
                    if (this.temp1 === null) {
                        if (data.type === 'Integer') {
                            this.temp1 = data;
                            return;
                        }
                        this.write(data, done);
                        return;
                    }
                    if (this.temp2 === null) {
                        if (data.type === 'Sym_.') {
                            this.temp2 = data;
                            return;
                        }
                        this.write(this.temp1, done);
                        this.write(data, done);
                        this.temp1 = null;
                        return
                    }
                    if (data.type === 'Integer') {
                        this.write(new ExpressionSimple("Decimal", this.temp1.line, this.temp1.pos, parseFloat(`${this.temp1.value}.${data.value}`)), false);
                        this.temp1 = null;
                        this.temp2 = null;
                        return;
                    }
                }
            }
        });
    }
    /**
     * @return {Transform}
     */
    getTransform() {
        let result = new Transform();
        result = result.pipe(this.stream_token_to_expression());

        if (this.hasFloats) {
            result = result.pipe(this.stream_find_decimals());
        }

        const that = this;
        const tstream = new (class TransformParser extends Transform {
            constructor() {
                super();
                this.stack = new Array();
            }
            read(data, done) {
                if (done) {
                    if (this.stack.length !== 1) {
                        console.error(this.stack);
                        console.error('ParserError: Incomplete AST after reaching end of file!');
                        return;
                    }
                    else {
                        this.write(this.stack[0], done);
                        return;
                    }
                }

                this.stack.push(data);

                loop_1:
                for (let j = 0; j < that.rules.length; j++) {
                    const rule = that.rules[j];
                    const l = this.stack.length;
                    const i = l - rule.keys.length;
                    const b = this.stack.slice(l - rule.keys.length, l);

                    if (rule.keys.length > this.stack.length) {
                        continue;
                    }
                    for (let i = 0; i < rule.keys.length; i++) {
                        const k = rule.keys[i];
                        if (typeof k === 'string') {
                            if (b[i].type !== k) {
                                continue loop_1;
                            }
                        }
                        if (typeof k === 'object') {
                            if (!(k.includes(b[i].type))) {
                                continue loop_1;
                            }
                        }
                    }

                    const exp = rule.onSuccess(this.stack, i);
                    new Array(rule.keys.length).fill(0).forEach(x => this.stack.pop());
                    this.stack.push(exp);
                    j = -1;
                }
            }
        })();

        result = result.pipe(tstream);

        return result;
    }
}
