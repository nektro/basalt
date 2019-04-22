/**
 * https://github.com/nektro/basalt/blob/master/src/file/torrent.js
 */
//
"use strict";
/**
 * parse a .torrent file as a JS Object
 * BitTorrent metainfo file
 * @see http://fileformats.wikia.com/wiki/Torrent_file
 */
//
import "https://unpkg.com/js-sha1@0.6.0/build/sha1.min.js";
import { pipe } from "../pipe.js";
import * as bencode from "./encoding/bencode.js";

//
export function decode(ui8a) {
    return new (class Torrent {
        constructor() {
            this.properties = pipe(ui8a, bencode.decode);
        }
        get announce() {
            return this.properties.get("announce");
        }
        get announce_list() {
            return (this.properties.get("announce-list")||[]).map(v => v[0]);
        }
        get creation_date() {
            return this.properties.get("creation date");
        }
        get comment() {
            return this.properties.get("comment");
        }
        get created_by() {
            return this.properties.get("created by");
        }
        get _info() {
            return this.properties.get("info");
        }
        get files() {
            return (this._info.get("files")||[]).map(v => [...v].reduce((ac,cv) => { ac[cv[0]] = cv[1]; return ac; }, {}));
        }
        get name() {
            return this._info.get("name");
        }
        get pieces() {
            return this._info.get("piece length");
        }
        get piece_hashes() {
            return pipe((this._info.get("pieces")||"").split(""), _array_group(20)).map(v => v.map(w => _char_to_hex(w)).reduce((c,v) => c+v, ""));
        }
        get info_hash() {
            return pipe(this._info, bencode.encode, _string_to_uint8a, sha1);
        }
        get magnet_link() {
            return `magnet:?xt=urn:btih:${this.info_hash}&dn=${encodeURIComponent(this.name)}${this.announce_list.reduce((ac,cv) => `${ac}&tr=${encodeURIComponent(cv)}`, "")}`;
        }
    })();
}
function _array_group(size) {
    return function(arr) {
        const arrays = [];
        while (arr.length > 0) arrays.push(arr.splice(0, size));
        return arrays;
    };
}
function _char_to_hex(c) {
    return c.charCodeAt(0).toString(16).padStart(2,"0");
}
function _string_to_uint8a(s) {
    return new Uint8Array(s.split("").map(v => v.charCodeAt(0)));
}
