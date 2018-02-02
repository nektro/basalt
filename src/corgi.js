//
import * as streams from "./stream.js";
import { Lexer } from "./lex.js";
import { Parser, ExpressionSimple, ExpressionContainer } from "./parse.js";


export const corgi_lexer = new (class extends Lexer {
    constructor() {
        super(
            [],
            ['(',')','[',']','=',','],
            ['"'],
            true,
            true
        );
    }
    isValidVarChar(c) {
        return ((c >= 'a') && (c <= 'z')) || ((c >= '0') && (c <= '9') || (c === '-'));
    }
})();

/**
 * @return {Lexer}
 */
export function lex() {
    return corgi_lexer.getTransform();
}

export const corgi_parser = new (class extends Parser {
    constructor() {
        super();
        const ELEMENTS = ["ElementI","ElementIA","ElementIC","ElementIAC"];

        this.addRule(["Identifier","Sym_=","String"], (list,i) => new ExpressionContainer("Attr", [list[i],list[i+2]]));
        this.addRule(["Attr"], (list, i) => new ExpressionContainer("AttrListPart", [list[i]]));
        this.addRule(["AttrListPart","Sym_,","AttrListPart"], (list, i) => new ExpressionContainer("AttrListPart", [...list[i].value,...list[i+2].value]));
        this.addRule(["Sym_[","AttrListPart","Sym_]"], (list, i) => new ExpressionContainer("AttrList", [...list[i+1].value]));

        this.addRule(["Identifier","AttrList"], (list,i) => new ExpressionContainer("ElementIA", [list[i],list[i+1]]));
        this.addRule(["Sym_(","ChildsPart"], (list, i) => new ExpressionContainer("Children", list[i+1].value));
        this.addRule(["String","Sym_)"], (list,i) => new ExpressionContainer("ChildsPart", [list[i]]));
        this.addRule(["Identifier","Children"], (list, i) => new ExpressionContainer("ElementIC", [list[i],list[i+1]]));
        this.addRule(["ElementIA","Children"], (list, i) => new ExpressionContainer("ElementIAC", [...list[i].value,list[i+1]]));
        this.addRule([ELEMENTS,"Sym_)"], (list, i) => new ExpressionContainer("ChildsPart", [list[i]]));
        this.addRule([ELEMENTS,"ChildsPart"], (list, i) => new ExpressionContainer("ChildsPart", [list[i],...list[i+1].value]));
        this.addRule(["String","ChildsPart"], (list, i) => new ExpressionContainer("ChildsPart", [list[i],...list[i+1].value]));
        this.addRule(["Identifier","ChildsPart"], (list, i) => new ExpressionContainer("ChildsPart", [new ExpressionSimple("ElementI", 0, 0, [list[i]]),...list[i+1].value]));
        this.addRule(["Identifier","Sym_)"], (list, i) => new ExpressionContainer("ChildsPart", [new ExpressionSimple("ElementI", 0, 0, [list[i]]),...list[i+1].value]));
    }
    isValidIdentifier(word) {
        return true;
    }
})();

/**
 * @return {Parser}
 */
export function parse() {
    return corgi_parser.getTransform();
}

export const compile = new (class extends streams.Transform {
    read(data, done) {
        this.write((function cE(ex) {
            switch (ex.type) {
                case 'Children': return ex.value.map(x => cE(x)).join('');
                case 'ElementIAC': return `<${cE(ex.value[0])}${cE(ex.value[1])}>${cE(ex.value[2])}</${cE(ex.value[0])}>`;
                case 'Identifier': return ex.value;
                case 'AttrList': return ex.value.map(x => ` ${cE(x)}`).join('');
                case 'Attr': return `${cE(ex.value[0])}="${cE(ex.value[1])}"`;
                case 'String': return ex.value.substring(1, ex.value.length - 1);
                case 'ElementIC': return `<${cE(ex.value[0])}>${cE(ex.value[1])}</${cE(ex.value[0])}>`;
                case 'ElementIA': return `<${cE(ex.value[0])}${cE(ex.value[1])}></${cE(ex.value[0])}>`;
                case 'ElementI': return `<${cE(ex.value[0])}/>`
                //
                default: console.warn(`no translation for ${ex.type}`, ex);
            }
        })(data), done);
    }
})();

/**
 * @return {Transform<Byte,String>}
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
 * @return {Promise<String>}
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
