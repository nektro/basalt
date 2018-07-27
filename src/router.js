/**
 * https://github.com/nektro/basalt/blob/master/src/router.js
 */
//
"use strict";
//


/**
 * @type {Router}
 */
export default class Router {
    constructor(r, ops) {
        const options = Object.assign({}, {extension:".html"}, ops || {});
        this.root = r;
        this.cache = new Map();
        this.extension = options.extension;
        this.element = document.body;
        window.addEventListener("hashchange", (e) => {
            this.gotoPage(e.newURL.substring(e.newURL.indexOf("#") + 1));
        });
    }
    resolveFileName(rt) {
        return [rt];
    }
    async getFileName(pn) {
        let rsn = this.resolveFileName(pn);
        if (rsn !== undefined) return Promise.resolve(rsn);
        return Promise.resolve(["/blank"]);
    }
    async processFile(src) {
        return src;
    }
    async __getPage(pn) {
        if (this.cache.has(pn)) {
            return Promise.resolve(this.cache.get(pn));
        }
        return fetch(this.root + pn + this.extension).then((r) => {
            if (r.status === 200) return r.text();
            if (pn === "/blank") return "";
            return this.__getPage("/blank");
        })
        .then((r) => {
            this.cache.set(pn, r);
            return Promise.resolve(r);
        });
    }
    async getPageContent(p) {
        return this.getFileName(p).then(x => {
            return this.__getPage(x[0]).then(async y => {
                return [await this.processFile(y),x];
            });
        });
    }
    async gotoPage(pn) {
        return this.getPageContent(pn).then((x) => {
            return this.setPageContent(...x);
        });
    }
    setPageContent(con) {
        this.element.innerHTML = `${con}`;
    }
    start(ch) {
        // fix hash
        if (location.hash.length === 0) {
            location.hash = "/";
        }
        else {
            // else hash is set, go to that
            this.gotoPage(location.hash.substring(1));
        }
        // set new root element
        if (ch instanceof HTMLElement) {
            this.element = ch;
        }
    }
}
