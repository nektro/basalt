/**
 * https://nektro.github.io/basalt/src/file/gb.js
 */
//
"use strict";
// parse a .gb file as a JS Object
// Nintendo GameBoy ROM
// @see http://bgb.bircd.org/pandocs.htm
//
export const NINTENDO_LOGO = new Uint8Array(("ceed6666cc0d000b03730083000c000d0008111f8889000edccc6ee6ddddd999bbbb67636e0eecccdddc999fbbb9333e").match(/[0-9a-f]{1,2}/g).map(x => parseInt(x,16)));
//
export const CartridgeType_B = {
    "00":[0],
    "01":[1],
    "02":[1,6],
    "03":[1,6,7],
    "05":[2],
    "06":[2,7],
    "08":[0,6],
    "09":[0,6,7],
    "0B":[8],
    "0C":[8,6],
    "0D":[8,6,7],
    "0F":[3,9,7],
    "10":[3,9,6,7],
    "11":[3],
    "12":[3,6],
    "13":[3,6,7],
    "15":[4],
    "16":[4,6],
    "17":[4,6,7],
    "19":[5],
    "1a":[5,6],
    "1b":[5,6,7],
    "1c":[5,10],
    "1d":[5,10,6],
    "1e":[5,10,6,7],
    "fc":[11],
    "fd":[12],
    "fe":[14],
    "ff":[13,6,7]
};
//
export const CartridgeType_F = [
    "ROM",
    "MBC1",
    "MBC2",
    "MBC3",
    "MBC4",
    "MBC5",
    "RAM",
    "BATTERY",
    "MMM01",
    "TIMER",
    "RUMBLE",
    "POCKET_CAMERA",
    "BANDAI_TAMA5",
    "HuC1",
    "HuC3"
];
//
export const ROM_Size_B = {
    "00": 0,
    "01": 4,
    "02": 8,
    "03": 16,
    "04": 32,
    "05": 64,
    "06": 128,
    "07": 256,
    "52": 72,
    "53": 80,
    "54": 96
};
//
export const RAM_Size_B = {
    "00": 0,
    "01": 2,
    "02": 8,
    "03": 32
};
//
export const Code_Dest_B = {
    "00": "J",
    "01": "U"
};
//
export function decode(ui8a) {
    const utf8 = new TextDecoder("utf-8");
    return new (class ROM_GB {
        constructor() {
            let p = 0;
            ui8a.slice(p, p+=256);
            this.bootSector = ui8a.slice(p, p+=4);
            console.assert(ui8a.slice(p, p+=NINTENDO_LOGO.length).every((v,i) => v === NINTENDO_LOGO[i]), "Nintendo Logo Verification failed!");
            this.title = utf8.decode(ui8a.slice(p, p+=16));
            this.nlc = ui8a.slice(p, p+=2);
            this.supportsSGB = ui8a.slice(p, p+=1)[0] === 3;
            this.cartridgeType = CartridgeType_B[ui8a.slice(p, p+=1)[0].toString(16).padStart(2,"0")].map(v => CartridgeType_F[v]);
            this.ROMsize = ROM_Size_B[ui8a.slice(p, p+=1)[0].toString(16).padStart(2,"0")];
            this.RAMsize = RAM_Size_B[ui8a.slice(p, p+=1)[0].toString(16).padStart(2,"0")];
            this.destCode = Code_Dest_B[ui8a.slice(p, p+=1)[0].toString(16).padStart(2,"0")];
            this.olc = ui8a.slice(p, p+=1);
            console.assert(ui8a.slice(p, p+=1)[0] === 0, "ROM Mask Version number does not match!");
            this.checksumH = ui8a.slice(p, p+=1);
            this.checksumG = ui8a.slice(p, p+=2);
        }
    })();
}
