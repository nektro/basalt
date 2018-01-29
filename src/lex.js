//

import { Transform } from "./stream.js";

export const TokenType = Object.freeze({
    Keyword: 'Keyword',
    Symbol: 'Symbol',
    Word: 'Word',
    String: 'String'
});

/**
 * @type {Token}
 */
export class Token {
    /**
     * @param {TokenType} ty
     * @param {String} val
     * @param {Number} l
     * @param {Number} p
     */
    constructor(ty, val, l, p) {
        this.type = ty;
        this.value = val;
        this.line = l;
        this.pos = p;
    }
    /**
     * @return {String}
     */
    toString() {
        return String.format("T_%c(%s)", this.type, this.value, this.line, this.this.pos);
    }
}

export const Mode = Object.freeze({
    Default: 0,
    String: 1,
    LComm: 2,
    MlComm: 3
});

/**
 * @type {Lexer}
 */
export class Lexer {
    /**
     * @param {Array<String>} keys
     * @param {Array<Character>} syms
     * @param {Array<Character>} strs
     * @param {Boolean} hLC
     * @param {Boolean} hMC
     */
    constructor(keys, syms, strs, hLC, hMC) {
        this.keywords = keys;
        this.symbols = syms;
        this.stringDelims = strs;
        this.hasLineComments = hLC;
        this.hasMultiComments = hMC;
    }
    /**
     * @param  {Character} c
     * @return {Boolean}
     */
    isValidVarChar(c) {
        return false;
    }
    /**
     * @param  {Character} c
     * @param  {Number} l
     * @param  {Number} p
     * @param  {Mode} m
     */
    throwError(c, l, p, m) {
        throw new Error(`LexerError: Invalid character '${c}' @ ${l}:${p}`);
    }
    /**
     * @return {Transform}
     */
    getTransform() {
        const that = this;
        return new (class extends Transform {
            constructor() {
                super();
                this.inM = Mode.Default;
                this.buffer = "";
                this.line = 1;
                this.pos = 1;
            }
            read(data) {
                const c = data;
                switch (this.inM) {
                    case Mode.Default: {
                        if (that.isValidVarChar(c)) {
                            this.buffer += c;
                        }
                        else
                        if (c === '/') {
                            if (that.hasLineComments) {
                                this.buffer += c;

                                if (this.buffer.endsWith(`//`)) {
                                    this.buffer = "";
                                    this.inM = Mode.LCom;
                                }
                            }
                            else
                            if (that.hasMultiComments) {
                                this.buffer += c;
                            }
                            else
                            if (!(that.symbols.includes(c))) {
                                that.throwError(c, line, this.pos);
                            }
                        }
                        else
                        if (c === '*') {
                            this.buffer += c;

                            if (that.hasMultiComments) {
                                if (this.buffer.endsWith(`/*`)) {
                                    this.inM = Mode.MlCom;
                                }
                            }
                        }
                        else
                        if (c === ' ' || c === '\n' || that.symbols.includes(c)) {
                            if (this.buffer.length > 0) {
                                if (that.keywords.includes(this.buffer)) {
                                    this.write(new Token(TokenType.Keyword, this.buffer, this.line, this.pos));
                                }
                                else {
                                    this.write(new Token(TokenType.Word, this.buffer, this.line, this.pos));
                                }

                                this.buffer = "";
                            }
                            if (that.symbols.includes(c)) {
                                this.write(new Token(TokenType.Symbol, c, this.line, this.pos));
                            }
                        }
                        else
                        if (['\t','\r'].includes(c)) {
                            //
                        }
                        else
                        if (that.stringDelims.includes(c)) {
                            this.buffer += c;
                            this.inM = Mode.String;
                        }
                        else {
                            that.throwError(c, this.line, this.pos);
                        }
                        break;
                    }
                    case Mode.String: {
                        this.buffer += c;

                        if (c == this.buffer.charAt(0)) {
                            if ((!(this.buffer.endsWith("\\" + c))) != (this.buffer.endsWith("\\\\" + c))) {
                                this.write(new Token(TokenType.String, this.buffer, this.line, this.pos - this.buffer.length));
                                this.buffer = "";
                                this.inM = Mode.Default;
                            }
                        }
                        break;
                    }
                    case Mode.LCom: {
                        if (c === '\n') {
                            this.inM = Mode.Default;
                            this.buffer = "";
                        }
                        break;
                    }
                    case Mode.MlCom: {
                        this.buffer += c;
                        if (this.buffer.endsWith([42,47].map(x => String.fromCharCode(x)))) {
                            this.inM = Mode.Default;
                            this.buffer = "";
                        }
                        break;
                    }
                }
                this.pos += 1;
                if (c !== '\n') return;
                this.line += 1;
                this.pos = 1;
            }
        })();
    }
}
