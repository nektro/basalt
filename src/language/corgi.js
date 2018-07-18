/**
 * https://github.com/nektro/basalt/blob/master/src/language/corgi.js
 */
//
"use strict";
//
import { Language } from "../language.js";
import { ExpressionSimple, ExpressionContainer } from "../parse.js";


//
const nES = (...args) => new ExpressionSimple(...args);
const nEC = (...args) => new ExpressionContainer(...args);

//
export default new (class extends Language {
    constructor() {
        super(
            [],
            ["(",")","[","]","=",","],
            ["\""],
            true,
            true,
        );

        this.parser.addRule(["Id","S_=","String"], (list,i) => nEC("Attr", [list[i],list[i+2]]));
        this.parser.addRule(["Attr"], (list, i) => nEC("AttrListPart", [list[i]]));
        this.parser.addRule(["AttrListPart","S_,","AttrListPart"], (list, i) => nEC("AttrListPart", [...list[i].value,...list[i+2].value]));
        this.parser.addRule(["S_[","AttrListPart","S_]"], (list, i) => nEC("AttrList", [...list[i+1].value]));

        this.parser.addRule(["Id","AttrList"], (list,i) => nEC("ElementIA", [list[i],list[i+1]]));
        this.parser.addRule(["S_(","ChildsPart"], (list, i) => nEC("Children", list[i+1].value));
        this.parser.addRule(["String","S_)"], (list,i) => nEC("ChildsPart", [list[i]]));
        this.parser.addRule(["Id","Children"], (list, i) => nEC("ElementIC", [list[i],list[i+1]]));
        this.parser.addRule(["ElementIA","Children"], (list, i) => nEC("ElementIAC", [...list[i].value,list[i+1]]));
        this.parser.addRule(["ELEMENTS","S_)"], (list, i) => nEC("ChildsPart", [list[i]]));
        this.parser.addRule(["ELEMENTS","ChildsPart"], (list, i) => nEC("ChildsPart", [list[i],...list[i+1].value]));
        this.parser.addRule(["String","ChildsPart"], (list, i) => nEC("ChildsPart", [list[i],...list[i+1].value]));
        this.parser.addRule(["Id","ChildsPart"], (list, i) => nEC("ChildsPart", [nES("ElementI", [list[i], 0, 0,]),...list[i+1].value]));
        this.parser.addRule(["Id","S_)"], (list, i) => nEC("ChildsPart", [nES("ElementI", [list[i], 0, 0,]),...list[i+1].value]));

        this.parser.addAlias("ELEMENTS", ["ElementI","ElementIA","ElementIC","ElementIAC"]);
    }
    isValidVarChar(c) {
        return ((c >= "a") && (c <= "z")) || ((c >= "0") && (c <= "9") || (c === "-"));
    }
    isValidIdentifier(word) {
        return true;
    }
    transform(ex) {
        switch (ex.type) {
            case "Children": return ex.value.map(x => this.transform(x)).join("");
            case "ElementIAC": return `<${this.transform(ex.value[0])}${this.transform(ex.value[1])}>${this.transform(ex.value[2])}</${this.transform(ex.value[0])}>`;
            case "Id": return ex.value;
            case "AttrList": return ex.value.map(x => ` ${this.transform(x)}`).join("");
            case "Attr": return `${this.transform(ex.value[0])}="${this.transform(ex.value[1])}"`;
            case "String": return ex.value.substring(1, ex.value.length - 1);
            case "ElementIC": return `<${this.transform(ex.value[0])}>${this.transform(ex.value[1])}</${this.transform(ex.value[0])}>`;
            case "ElementIA": return `<${this.transform(ex.value[0])}${this.transform(ex.value[1])}></${this.transform(ex.value[0])}>`;
            case "ElementI": return `<${this.transform(ex.value[0])}/>`;
            //
            default:
                console.warn(ex);
                throw new Error(`no transformation for ${ex.type}`);
        }
    }
})();
