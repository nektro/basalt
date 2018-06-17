/**
 * https://nektro.github.io/basalt/src/lex.js
 */
//
"use strict";
//
import { Transform } from "./stream.js";


export const TokenType = Object.freeze({
    Keyword: "Keyword",
    Symbol: "Symbol",
    Word: "Word",
    String: "String"
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
        return `T_${this.type}(${this.value}){${this.line}:${this.pos}}`;
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
     */
    throwError(c, l, p) {
        console.error(`LexerError: Invalid character "${c}" @ ${l}:${p}`);
        return;
    }
    /**
     * @return {Transform<Character,Token>}
     */
    getTransform() {
        const that = this;
        return new (class TransformLexer extends Transform {
            constructor() {
                super();
                this.inM = Mode.Default;
                this.buffer = "";
                this.line = 1;
                this.pos = 1;
            }
            read(data, done) {
                if (done) {
                    this.write(data, done);
                    return;
                }
                const c = data;
                switch (this.inM) {
                    case Mode.Default: {
                        if (that.isValidVarChar(c)) {
                            this.buffer += c;
                        }
                        else
                        if (c === "/") {
                            if (that.hasLineComments) {
                                this.buffer += c;

                                if (this.buffer.endsWith(`//`)) {
                                    this.buffer = "";
                                    this.inM = Mode.LComm;
                                }
                            }
                            else
                            if (that.hasMultiComments) {
                                this.buffer += c;
                            }
                            else
                            if (!(that.symbols.includes(c))) {
                                that.throwError(c, this.line, this.pos);
                                return;
                            }
                        }
                        else
                        if (c === "*") {
                            this.buffer += c;

                            if (that.hasMultiComments) {
                                if (this.buffer.endsWith(`/*`)) {
                                    this.inM = Mode.MlComm;
                                }
                            }
                        }
                        else
                        if (c === " " || c === "\n" || that.symbols.includes(c)) {
                            if (this.buffer.length > 0) {
                                if (that.keywords.includes(this.buffer)) {
                                    this.write(new Token(TokenType.Keyword, this.buffer, this.line, this.pos), false);
                                }
                                else {
                                    this.write(new Token(TokenType.Word, this.buffer, this.line, this.pos), false);
                                }

                                this.buffer = "";
                            }
                            if (that.symbols.includes(c)) {
                                this.write(new Token(TokenType.Symbol, c, this.line, this.pos), false);
                            }
                        }
                        else
                        if (["\t","\r"].includes(c)) {
                            //
                        }
                        else
                        if (that.stringDelims.includes(c)) {
                            this.buffer += c;
                            this.inM = Mode.String;
                        }
                        else {
                            that.throwError(c, this.line, this.pos);
                            return;
                        }
                        break;
                    }
                    case Mode.String: {
                        this.buffer += c;

                        if (c == this.buffer.charAt(0)) {
                            if ((!(this.buffer.endsWith("\\" + c))) != (this.buffer.endsWith("\\\\" + c))) {
                                this.write(new Token(TokenType.String, this.buffer, this.line, this.pos - this.buffer.length), done);
                                this.buffer = "";
                                this.inM = Mode.Default;
                            }
                        }
                        break;
                    }
                    case Mode.LComm: {
                        if (c === "\n") {
                            this.inM = Mode.Default;
                            this.buffer = "";
                        }
                        break;
                    }
                    case Mode.MlComm: {
                        this.buffer += c;
                        if (this.buffer.endsWith([42,47].map(x => String.fromCharCode(x)).join(""))) {
                            this.inM = Mode.Default;
                            this.buffer = "";
                        }
                        break;
                    }
                }
                this.pos += 1;
                if (c !== "\n") return;
                this.line += 1;
                this.pos = 1;
            }
        })();
    }
}
