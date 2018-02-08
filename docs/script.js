//
'use strict';

//
import Router from "https://rawgit.com/Nektro/modules.js/master/src/Router.js";
import corgi from "https://rawgit.com/Nektro/modules.js/master/src/language/corgi.js";

//
const router = new (class extends Router {
    constructor() {
        super('pages', { extension:'.corgi' });
    }
    async processFile(src) {
        return corgi.stream(new Response(src).body);
    }
})();

//
router.start(document.getElementById('page'));
