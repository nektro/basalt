/**
 * https://github.com/nektro/basalt/blob/master/src/language.js
 */
//
"use strict";
//
import { Lexer } from "./lex.js";
import { Parser, ExpressionContainer } from "./parse.js";


/**
 * @type {Language}
 */
export class Language {
    /**
     * @param {Array<String>} keys
     * @param {Array<String>} symbols
     * @param {Array<String>} strings
     * @param {boolean} hasLineComments
     * @param {boolean} hasMultiComments
     */
    constructor(keys, symbols, strings, hasLineComments, hasMultiComments) {
        const that = this;
        this.lexer = new (class extends Lexer {
            constructor() {
                super(keys, symbols, strings, hasLineComments, hasMultiComments);
            }
            isValidVarChar(c) {
                return that.isValidVarChar(c);
            }
        })();
        this.parser = new (class extends Parser {
            constructor() {
                super();
            }
            is_valid_identifier(word) {
                return that.is_valid_identifier(word);
            }
        })();
    }
    /**
     * @param {String} c
     * @returns {Boolean}
     */
    isValidVarChar(c) {
        return false;
    }
    /**
     * @param {String} word
     * @returns {Boolean}
     */
    is_valid_identifier(word) {
        return false;
    }
    /**
     * @param {ExpressionContainer} expression
     * @returns {String|Uint8Array}
     */
    transform(expression) {
        throw new Error("No expression transformation found!");
    }
    /**
     * @param {String} src_text
     * @returns {Promise<String|Uint8Array>}
     */
    async parse(src_text) {
        return Promise.resolve(src_text)
        .then(x => this.lexer.parse(x))
        .then(x => this.parser.convert_tokens_to_expressions(x))
        .then(x => this.parser.parse(x))
        .then(x => this.transform(x));
    }
}
