/**
 * https://github.com/nektro/basalt/blob/master/src/language/json.js
 */
//
"use strict";
//
import { Language } from "../language.js";
import { ExpressionSimple, ExpressionContainer } from "../parse.js";


export default new (class extends Language {
    constructor() {
        super(
            ["true","false","null"],
            ["{","}","[","]",":",",",".","-"],
            ["\""],
            true,
            true,
            true
        );

        const VALUE = ["String","Decimal","Integer","Object","Array","Key_true","Key_false","Key_null"];

        this.parser.addRule(["Sym_-","Decimal"], function(list, i) {
            const a = list[i];
            return new ExpressionSimple("Decimal", a.line, a.pos, (list[i+1].value * -1));
        });

        this.parser.addRule(["String","Sym_:",VALUE], function(list, i) {
            return new ExpressionContainer("Pair", [list[i],list[i+2]]);
        });
        this.parser.addRule(["Pair","Sym_,"], function(list, i) {
            return new ExpressionContainer("Members", [list[i]]);
        });
        this.parser.addRule(["Members","Members"], function(list, i) {
            return new ExpressionContainer("Members", [...list[i].value,...list[i+1].value]);
        });
        this.parser.addRule(["Sym_{","Pair","Sym_}"], function(list, i) {
            return new ExpressionContainer("Object", [list[i+1]]);
        });
        this.parser.addRule(["Sym_{","Members","Pair","Sym_}"], function(list, i) {
            return new ExpressionContainer("Object", [...list[i+1].value,list[i+2]]);
        });
        this.parser.addRule(["Sym_{","Sym_}"], function(list, i) {
            return new ExpressionContainer("Object", [], list[i].line, list[i].pos);
        });

        this.parser.addRule([VALUE,"Sym_,"], function(list, i) {
            return new ExpressionContainer("Elements", [list[i],]);
        });
        this.parser.addRule(["Elements","Elements"], function(list, i) {
            return new ExpressionContainer("Elements", [...list[i].value,...list[i+1].value]);
        });
        this.parser.addRule(["Sym_[","Elements",VALUE,"Sym_]"], function(list, i) {
            return new ExpressionContainer("Array", [...list[i+1].value,list[i+2]]);
        });
        this.parser.addRule(["Sym_[",VALUE,"Sym_]"], function(list, i) {
            return new ExpressionContainer("Array", [list[i+1]]);
        });
        this.parser.addRule(["Sym_[","Sym_]"], function(list, i) {
            return new ExpressionContainer("Array", [], list[i].line, list[i].pos);
        });
    }
    isValidVarChar(c) {
        return ((c >= "a") && (c <= "z")) || ((c >= "0") && (c <= "9"));
    }
    compileExpression(ex) {
        switch (ex.type) {
            case "Array":     return ex.value.map(v => this.compileExpression(v));
            case "Object":    return Object.assign({}, ...ex.value.map(v => this.compileExpression(v)));
            case "Pair":      return Object.defineProperty({}, this.compileExpression(ex.value[0]), { value:this.compileExpression(ex.value[1]), configurable:true, enumerable:true, writable:true });
            case "String":    return ex.value.substring(1, ex.value.length - 1);
            case "Integer":
            case "Decimal":   return ex.value;
            case "Key_null":  return null;
            case "Key_false": return false;
            case "Key_true":  return true;
            //
            default: console.warn(`no translation for ${ex.type}`, ex);
        }
    }
})();
