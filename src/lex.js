/**
 * https://github.com/nektro/basalt/blob/master/src/lex.js
 */
//
"use strict";
//

/**
 * @type {TokenType}
 */
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
     * @returns {String}
     */
    toString() {
        return `T_${this.type}(${this.value}){${this.line}:${this.pos}}`;
    }
}

/**
 * @type {Mode}
 */
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
     * @param {Array<String>} syms
     * @param {Array<String>} strs
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
     * @param  {String} c
     * @returns {Boolean}
     */
    isValidVarChar(c) {
        return false;
    }
    /**
     * @param  {String} c
     * @param  {Number} l
     * @param  {Number} p
     */
    throwError(c, l, p) {
        throw new Error(`LexerError: Invalid character "${c}" @ ${l}:${p}`);
    }
    async parse(text) {
        const results = [];
        let inM = Mode.Default;
        let buffer = "";
        let line = 1;
        let pos = 1;

        for (const c of text) {
            switch (inM) {
                case Mode.Default: {
                    if (this.isValidVarChar(c)) {
                        buffer += c;
                    }
                    else
                    if (c === "/") {
                        if (this.hasLineComments) {
                            buffer += c;

                            if (buffer.endsWith("//")) {
                                buffer = "";
                                inM = Mode.LComm;
                            }
                        }
                        else
                        if (this.hasMultiComments) {
                            buffer += c;
                        }
                        else
                        if (!(this.symbols.includes(c))) {
                            this.throwError(c, line, pos, results);
                            return;
                        }
                    }
                    else
                    if (c === "*") {
                        if (this.hasMultiComments) {
                            buffer += c;

                            if (buffer.endsWith("/*")) {
                                inM = Mode.MlComm;
                            }
                            else
                            if (!(this.symbols.includes("*"))) {
                                this.throwError("*", line, pos, results);
                            }
                        }
                    }
                    else
                    if (c === " " || c === "\n" || this.symbols.includes(c)) {
                        if (buffer.length > 0) {
                            if (this.symbols.includes(buffer)) { // for / and *
                                results.push(new Token(TokenType.Symbol, buffer, line, pos-buffer.length, 3));
                            }
                            else
                            if (this.keywords.includes(buffer)) {
                                results.push(new Token(TokenType.Keyword, buffer, line, pos-buffer.length, 1));
                            }
                            else {
                                results.push(new Token(TokenType.Word, buffer, line, pos-buffer.length, 2));
                            }
                            buffer = "";
                        }
                        if (this.symbols.includes(c)) {
                            results.push(new Token(TokenType.Symbol, c, line, pos+1, 3));
                        }
                    }
                    else
                    if (["\t","\r"].includes(c)) {
                        //
                    }
                    else
                    if (this.stringDelims.includes(c)) {
                        buffer += c;
                        inM = Mode.String;
                    }
                    else {
                        this.throwError(c, line, pos, results);
                        return;
                    }
                    break;
                }
                case Mode.String: {
                    buffer += c;

                    if (c == buffer.charAt(0)) {
                        if ((!(buffer.endsWith("\\" + c))) != (buffer.endsWith("\\\\" + c))) {
                            results.push(new Token(TokenType.String, buffer, line, pos - buffer.length, 4));
                            buffer = "";
                            inM = Mode.Default;
                        }
                    }
                    break;
                }
                case Mode.LComm: {
                    if (c === "\n") {
                        inM = Mode.Default;
                        buffer = "";
                    }
                    break;
                }
                case Mode.MlComm: {
                    buffer += c;
                    if (buffer.endsWith([42,47].map(x => String.fromCharCode(x)).join(""))) {
                        inM = Mode.Default;
                        buffer = "";
                    }
                    break;
                }
            }
            pos += 1;
            if (c !== "\n") continue;
            line += 1;
            pos = 1;
        }
        return results;
    }
}
