//
'use strict';

import { Transform, stringify } from "./stream.js";
import { Lexer } from "./lex.js";
import { Parser } from "./parse.js";


/**
 * @type {Language}
 */
export class Language {
    /**
     * @param {Array<String>}  keys
     * @param {Array<Character>}  syms
     * @param {Array<Character>}  strs
     * @param {Boolean}  hLC
     * @param {Boolean}  hMC
     * @param {Boolean} hasFloats
     */
    constructor(keys, syms, strs, hLC, hMC, hasFloats) {
        const that = this;
        this.lexer = new (class extends Lexer {
            constructor() {
                super(keys, syms, strs, hLC, hMC);
            }
            isValidVarChar(c) {
                return that.isValidVarChar(c);
            }
        })();
        this.parser = new (class extends Parser {
            constructor() {
                super(hasFloats);
            }
            isValidIdentifier(word) {
                return that.isValidIdentifier(word);
            }
        })();
        this.compile = new (class extends Transform {
            read(data, done) {
                this.write(((ex) => {
                    return that.compileExpression(ex);
                })(data), done);
            }
        })();
    }
    /**
     * @param  {Character}  c
     * @return {Boolean}
     */
    isValidVarChar(c) {
        return false;
    }
    /**
     * @return {Transform<Character,Token>}
     */
    lex() {
        return this.lexer.getTransform();
    }
    /**
     * @param  {String}  word
     * @return {Boolean}
     */
    isValidIdentifier(word) {
        return false;
    }
    /**
     * @return {Transform<Token,Expression>}
     */
    parse() {
        return this.parser.getTransform();
    }
    /**
     * @param  {Expression} exp
     * @return {?}
     */
    compileExpression(exp) {
        throw new Error('CompileError: method not defined.');
    }
    /**
     * @return {Transform<Byte,?}
     */
    transform() {
        return new Transform()
        .pipe(stringify)
        .pipe(this.lex())
        .pipe(this.parse())
        .pipe(this.compile);
    }
    /**
     * @param  {ReadableStream} readable
     * @return {Promise<?>}
     */
    stream(readable) {
        return new Promise((resolve, reject) => {
            Transform.start(readable)
            .pipe(this.transform())
            .pipe(new (class extends Transform {
                read(data, done) {
                    resolve(data);
                }
            })());
        });
    }
}
