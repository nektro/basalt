/**
 * https://github.com/nektro/basalt/blob/master/src/file/nes.js
 */
//
"use strict";
/**
 * parse a .nes file as a JS Object
 * Nintendo Entertainment System ROM
 * @see http://fms.komkon.org/EMUL8/NES.html
 * @see https://wiki.nesdev.com/w/index.php/INES
 */
//
export const NES_SIG = new Uint8Array([0x4E,0x45,0x53,0x1A]);
//
export function decode(ui8a) {
    return new (class ROM_NES {
        constructor() {
            let p = 0;
            this.signature = ui8a.slice(0, p += 4);
            console.assert(this.signature.every((v,i) => v === NES_SIG[i]), "Invalid iNES signature");
            this.sizePrgRom = ui8a.slice(p, p += 1)[0];
            this.sizeChrRom = ui8a.slice(p, p += 1)[0];
            this.flag6 = ui8a.slice(p, p += 1)[0];
            this.flag7 = ui8a.slice(p, p += 1)[0];
            this.sizePrgRam = ui8a.slice(p, p += 1)[0];
            this.flag9 = ui8a.slice(p, p += 1)[0];
            this.flag10 = ui8a.slice(p, p += 1)[0];
            console.assert(ui8a.slice(p, p += 5).every(v => v === 0), "Bytes 11-15 must be 0!");
            if ((this.flag6 & 4) > 0) this.trainer = ui8a.slice(p, p += 512);
            this.prgROM = ui8a.slice(p, p += (16384*this.sizePrgRom));
            this.chrROM = ui8a.slice(p, p += (8192*this.sizeChrRom));
            if ((this.flag7 & 2) > 0) this.playChoice_INST_ROM = ui8a.slice(p, p += 8192);
            if ((this.flag7 & 2) > 0) this.playChoice_PROM = ui8a.slice(p, p += 16);
        }
    })();
}
