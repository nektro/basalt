//
'use strict';

import { Transform, stringify } from "./stream.js";
import { Lexer } from "./lex.js";
import { Parser } from "./parse.js";


export class Language {
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
    isValidVarChar(c) {
        return false;
    }
    lex() {
        return this.lexer.getTransform();
    }
    isValidIdentifier(word) {
        return false;
    }
    parse() {
        return this.parser.getTransform();
    }
    compileExpression(exp) {
        throw new Error('CompileError: method not defined.');
    }
    transform() {
        return new Transform()
        .pipe(stringify)
        .pipe(this.lex())
        .pipe(this.parse())
        .pipe(this.compile);
    }
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
