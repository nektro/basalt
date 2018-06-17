/**
 */
//
"use strict";
//
import { Language } from "../language.js";
import { ExpressionSimple, ExpressionContainer } from "../parse.js";


export default new (class extends Language {
    constructor() {
        super(
            [],
            ["(",")","[","]","=",","],
            ["\""],
            true,
            true,
            false
        );

        const ELEMENTS = ["ElementI","ElementIA","ElementIC","ElementIAC"];

        this.parser.addRule(["Identifier","Sym_=","String"], (list,i) => new ExpressionContainer("Attr", [list[i],list[i+2]]));
        this.parser.addRule(["Attr"], (list, i) => new ExpressionContainer("AttrListPart", [list[i]]));
        this.parser.addRule(["AttrListPart","Sym_,","AttrListPart"], (list, i) => new ExpressionContainer("AttrListPart", [...list[i].value,...list[i+2].value]));
        this.parser.addRule(["Sym_[","AttrListPart","Sym_]"], (list, i) => new ExpressionContainer("AttrList", [...list[i+1].value]));

        this.parser.addRule(["Identifier","AttrList"], (list,i) => new ExpressionContainer("ElementIA", [list[i],list[i+1]]));
        this.parser.addRule(["Sym_(","ChildsPart"], (list, i) => new ExpressionContainer("Children", list[i+1].value));
        this.parser.addRule(["String","Sym_)"], (list,i) => new ExpressionContainer("ChildsPart", [list[i]]));
        this.parser.addRule(["Identifier","Children"], (list, i) => new ExpressionContainer("ElementIC", [list[i],list[i+1]]));
        this.parser.addRule(["ElementIA","Children"], (list, i) => new ExpressionContainer("ElementIAC", [...list[i].value,list[i+1]]));
        this.parser.addRule([ELEMENTS,"Sym_)"], (list, i) => new ExpressionContainer("ChildsPart", [list[i]]));
        this.parser.addRule([ELEMENTS,"ChildsPart"], (list, i) => new ExpressionContainer("ChildsPart", [list[i],...list[i+1].value]));
        this.parser.addRule(["String","ChildsPart"], (list, i) => new ExpressionContainer("ChildsPart", [list[i],...list[i+1].value]));
        this.parser.addRule(["Identifier","ChildsPart"], (list, i) => new ExpressionContainer("ChildsPart", [new ExpressionSimple("ElementI", 0, 0, [list[i]]),...list[i+1].value]));
        this.parser.addRule(["Identifier","Sym_)"], (list, i) => new ExpressionContainer("ChildsPart", [new ExpressionSimple("ElementI", 0, 0, [list[i]]),...list[i+1].value]));

    }
    isValidVarChar(c) {
        return ((c >= "a") && (c <= "z")) || ((c >= "0") && (c <= "9") || (c === "-"));
    }
    isValidIdentifier(word) {
        return true;
    }
    compileExpression(ex) {
        switch (ex.type) {
            case "Children": return ex.value.map(x => this.compileExpression(x)).join("");
            case "ElementIAC": return `<${this.compileExpression(ex.value[0])}${this.compileExpression(ex.value[1])}>${this.compileExpression(ex.value[2])}</${this.compileExpression(ex.value[0])}>`;
            case "Identifier": return ex.value;
            case "AttrList": return ex.value.map(x => ` ${this.compileExpression(x)}`).join("");
            case "Attr": return `${this.compileExpression(ex.value[0])}="${this.compileExpression(ex.value[1])}"`;
            case "String": return ex.value.substring(1, ex.value.length - 1);
            case "ElementIC": return `<${this.compileExpression(ex.value[0])}>${this.compileExpression(ex.value[1])}</${this.compileExpression(ex.value[0])}>`;
            case "ElementIA": return `<${this.compileExpression(ex.value[0])}${this.compileExpression(ex.value[1])}></${this.compileExpression(ex.value[0])}>`;
            case "ElementI": return `<${this.compileExpression(ex.value[0])}/>`
            //
            default: console.warn(`no translation for ${ex.type}`, ex);
        }
    }
})();
