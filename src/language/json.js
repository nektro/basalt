//
'use strict';

import * as streams from "../stream.js";
import { Lexer } from "../lex.js";
import { Parser, ExpressionSimple, ExpressionContainer } from "../parse.js";


export const json_lexer = new (class extends Lexer {
    constructor() {
        super(
            ['true','false','null'],
            ['{','}','[',']',':',',','.','-'],
            ['"'],
            false,
            false
        );
    }
    isValidVarChar(c) {
        return ((c >= 'a') && (c <= 'z')) || ((c >= '0') && (c <= '9'));
    }
})();

/**
 * @return {streams.Transform<Byte,Token>} [description]
 */
export function lex() {
    return json_lexer.getTransform();
}

export const json_parser = new (class extends Parser {
    constructor() {
        super(true);
        const VALUE = ["String","Decimal","Integer","Object","Array","Key_true","Key_false","Key_null"];

        this.addRule(["Sym_-","Decimal"], function(list, i) {
            const a = list[i];
            return new ExpressionSimple("Decimal", a.line, a.pos, (list[i+1].value * -1));
        });

        this.addRule(["String","Sym_:",VALUE], function(list, i) {
            return new ExpressionContainer("Pair", [list[i],list[i+2]]);
        });
        this.addRule(["Pair","Sym_,"], function(list, i) {
            return new ExpressionContainer("Members", [list[i]]);
        });
        this.addRule(["Members","Members"], function(list, i) {
            return new ExpressionContainer("Members", [...list[i].value,...list[i+1].value]);
        });
        this.addRule(["Sym_{","Pair","Sym_}"], function(list, i) {
            return new ExpressionContainer("Object", [list[i+1]]);
        });
        this.addRule(["Sym_{","Members","Pair","Sym_}"], function(list, i) {
            return new ExpressionContainer("Object", [...list[i+1].value,list[i+2]]);
        });
        this.addRule(["Sym_{","Sym_}"], function(list, i) {
            return new ExpressionContainer("Object", [], list[i].line, list[i].pos);
        });

        this.addRule([VALUE,"Sym_,"], function(list, i) {
            return new ExpressionContainer("Elements", [list[i],]);
        });
        this.addRule(["Elements","Elements"], function(list, i) {
            return new ExpressionContainer("Elements", [...list[i].value,...list[i+1].value]);
        });
        this.addRule(["Sym_[","Elements",VALUE,"Sym_]"], function(list, i) {
            return new ExpressionContainer("Array", [...list[i+1].value,list[i+2]]);
        });
        this.addRule(["Sym_[",VALUE,"Sym_]"], function(list, i) {
            return new ExpressionContainer("Array", [list[i+1]]);
        });
        this.addRule(["Sym_[","Sym_]"], function(list, i) {
            return new ExpressionContainer("Array", [], list[i].line, list[i].pos);
        });
    }
})();

/**
 * @return {streams.Transform<Token,Expression>}
 */
export function parse() {
    return json_parser.getTransform();
}

export const compile = new (class extends streams.Transform {
    read(data, done) {
        this.write((function convertExp(ex) {
            switch (ex.type) {
                case 'Array':     return ex.value.map(v => convertExp(v));
                case 'Object':    return Object.assign({}, ...ex.value.map(v => convertExp(v)));
                case 'Pair':      return Object.defineProperty({}, convertExp(ex.value[0]), { value:convertExp(ex.value[1]), configurable:true, enumerable:true, writable:true });
                case 'String':    return ex.value.substring(1, ex.value.length - 1);
                case 'Integer':
                case 'Decimal':   return ex.value;
                case 'Key_null':  return null;
                case 'Key_false': return false;
                case 'Key_true':  return true;
                //
                default: console.warn(`no translation for ${ex.type}`, ex);
            }
        })(data), done);
    }
})();

/**
 * @return {Array<streams.Transform>}
 */
export function transform() {
    return new streams.Transform()
    .pipe(streams.stringify)
    .pipe(lex())
    .pipe(parse())
    .pipe(compile);
}

/**
 * @param  {ReadableStream} readable
 * @return {Promise}
 */
export function stream(readable) {
    return new Promise(function(resolve, reject) {
        streams.Transform.start(readable)
        .pipe(transform())
        .pipe(new (class extends streams.Transform {
            read(data, done) {
                resolve(data);
            }
        })());
    });
}
