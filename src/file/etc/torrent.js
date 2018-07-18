/**
 * https://github.com/nektro/basalt/blob/master/src/file/etc/torrent.js
 */
//
"use strict";
/**
 * parse a .torrent file as a JS Object
 * BitTorrent metainfo file
 * @see http://fileformats.wikia.com/wiki/Torrent_file
 */
//
import { pipe } from "../../pipe.js";
import * as bencode from "../encoding/bencode.js";

//
export function decode(ui8a) {
    return new (class Torrent {
        constructor() {
            const properties = pipe(ui8a, bencode.decode);
            this.announce = properties.get("announce");
            this.announce_list = properties.get("announce-list").map(v => v[0]);
            this.creation_date = properties.get("creation date");
            this.comment = properties.get("comment");
            this.created_by = properties.get("created by");
            const info = properties.get("info");
            this.files = info.get("files").map(v => [...v].reduce((ac,cv) => { ac[cv[0]] = cv[1]; return ac; }, {}));
            this.name = info.get("name");
            this.pieces = info.get("piece length");
            this.piece_hashes = pipe(info.get("pieces").split(""), _array_group(20)).map(v => v.map(w => _char_to_hex(w)).reduce((c,v) => c+v, ""));
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
