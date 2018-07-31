/**
 * https://github.com/nektro/basalt/blob/master/src/parse.js
 */
//
"use strict";
//
import { TokenType } from "./lex.js";

/**
 * @type {Expression}
 */
export class Expression {
    /**
     * @param {String} t
     * @param {Number} l
     * @param {Number} p
     */
    constructor(t, l, p) {
        this.type = t;
        this.line = l;
        this.pos = p;
    }
}

/**
 * @type {ExpressionSimple}
 */
export class ExpressionSimple extends Expression {
    /**
     * @param {String} n
     * @param {String|Number|Expression} v
     * @param {Number} l
     * @param {Number} p
     */
    constructor(n, v, l, p) {
        super(n, v instanceof Expression ? v.line : l, v instanceof Expression ? v.pos : p);
        this.value = v;
    }
}

/**
 * @type {ExpressionContainer}
 */
export class ExpressionContainer extends Expression {
    /**
     * @param {String} n
     * @param {Array<Expression>} v
     * @param {Number} l
     * @param {Number} p
     */
    constructor(n, v, l, p) {
        super(n, v.length > 0 ? v[0].line : l, v.length > 0 ? v[0].pos : p);
        this.value = v;
    }
}

/**
 * @type {ParserParseRule}
 */
export class ParserParseRule {
    constructor(ks, os) {
        this.keys = ks;
        this.onSuccess = os;
    }
}

/**
 * @type {Parser}
 */
export class Parser {
    static _results_add_new_expression(list, index, rule_length, exp) {
        list.splice(index, rule_length, exp);
        list[index] = exp;
    }
    constructor() {
        this.rules = [[],[]];
        this.aliases = [[],[]];
    }
    async convert_tokens_to_expressions(token_list) {
        return token_list.map(x => {
            switch (x.type) {
                case TokenType.Keyword: return new ExpressionSimple("K_" + x.value, "", x.line, x.pos);
                case TokenType.Symbol:  return new ExpressionSimple("S_" + x.value, "", x.line, x.pos);
                case TokenType.String:  return new ExpressionSimple("String", x.value, x.line, x.pos);
                case TokenType.Word: {
                    if (this.is_valid_identifier(x.value)) return new ExpressionSimple("Id", x.value, x.line, x.pos);
                    if (new RegExp(/[0-9]+/, "g").test(x.value)) return new ExpressionSimple("Int", BigInt(x.value), x.line, x.pos);
                    throw new Error(`ParserError: Invalid identifier "${x.value}" @ ${x.line}:${x.pos}`);
                }
            }
        });
    }
    is_valid_identifier(word) {
        return false;
    }
    async parse(exp_list) {
        const results = [];

        // do once rules
        for (const exp of exp_list) {
            results.push(exp);

            for (const rule of this.rules[0]) {
                this._parse_test_rule_at_index(results, rule, results.length);
            }
            // this._parse_test_all_rules_of_type(results, 0, results.length);
        }

        // do looping rules
        while (true) {
            const length = results.length;
            
            for (let i = 0; i <= results.length; i++) {
                for (const rule of this.rules[1]) {
                    this._parse_test_rule_at_index(results, rule, i);
                }
            }
            if (length === results.length) {
                break;
            }
        }

        // error if parsing failed / insufficient rules were added
        if (results.length > 1) {
            console.debug(results);
            throw new Error("ParserError: Incomplete AST after trying all grammar rules!");
        }
        return results[0];
    }
    _parse_test_rule_at_index(token_list, rule, index) {
        const l = rule.keys.length;
        const i = index - l;
        if (i < 0) return;
        if (i + l > token_list.length) return;
        if (this._parse_should_replace(token_list, rule, i)) {
            Parser._results_add_new_expression(token_list, i, l, rule.onSuccess(token_list, i));
        }
    }
    _parse_should_replace(tokens, rule, start) {
        for (let i = 0; i < rule.keys.length; i++) {
            const key = rule.keys[i];
            const token_checking = tokens[start+i];
            const is_key_raw = token_checking.type === key;
            const is_key_alias = this.aliases[0].includes(key);
            const key_is_alias = is_key_alias && this.aliases[1][this.aliases[0].indexOf(key)].includes(token_checking.type);

            if (!(is_key_raw || key_is_alias)) {
                return false;
            }
        }
        return true;
    }
    /**
     * @callback NewParseRuleCallback
     * @param {Array<Expression>} list
     * @param {Number} index
     * @returns {Expression}
     */
    /**
     * @param {Array<String>} pattern
     * @param {NewParseRuleCallback} callback
     * @param {Boolean} once
     */
    addRule(pattern, callback, once=false) {
        this.rules[once ? 0 : 1].push(new ParserParseRule(pattern, callback));
    }
    /**
     * @param {String} key
     * @param {Array<String>} alternates
     */
    addAlias(key, alternates) {
        this.aliases[0].push(key);
        this.aliases[1].push(alternates);
    }
}
