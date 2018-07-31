/**
 * https://github.com/nektro/basalt/blob/master/src/file/image/bmp.js
 */
//
"use strict";
/**
 * parse a .bmp file as a JS Object
 * Microsoft Windows Bitmap Image
 * @see https://docs.microsoft.com/en-us/windows/desktop/gdi/bitmap-storage
 */
//
import { pipe } from "./../../pipe.js";
import { _read_Uint16le, _read_Uint32le, _read_string, _read_raw, arr_reverse } from "../_util.js";

//
export const Compression = Object.freeze({
    BI_RGB:       0x0000,
    BI_RLE8:      0x0001,
    BI_RLE4:      0x0002,
    BI_BITFIELDS: 0x0003,
    BI_JPEG:      0x0004,
    BI_PNG:       0x0005,
    BI_CMYK:      0x000B,
    BI_CMYKRLE8:  0x000C,
    BI_CMYKRLE4:  0x000D
});

//
const _read_ms_word  = _read_Uint16le;
const _read_ms_dword = _read_Uint32le;
const _read_ms_long  = _read_Uint32le;

//
export function decode(ui8a) {
    return new (class BMP {
        constructor() {
            readBITMAPFILEHEADER.bind(this)(ui8a);
            readBITMAPINFO.bind(this)(ui8a);
        }
        get image() {
            if (this.bmiHeader.biBitCount === 24 && this.bmiHeader.biCompression === Compression.BI_RGB) {
                const w = this.bmiHeader.biWidth;
                const h = this.bmiHeader.biHeight;

                const d1 = new Array(h).fill(0).map(() => new Array(w));
                for (let i = 0; i < h; i++)
                    for (let j = 0; j < w; j++)
                        d1[i][(w-j+i)%w] = ([...pipe(ui8a, _read_raw(3), arr_reverse), 255]);

                const d11 = d1.reduce((c,v) => {c.push(...v); return c;}, []);
                const d12 = d11.reverse().reduce((c,v) => {c.push(...v); return c;}, []);
                const d2 = Uint8ClampedArray.from(d12);
                const d3 = new ImageData(d2, w, h);
                
                const can = document.createElement("canvas");
                const ctx = can.getContext("2d");

                can.width = w;
                can.height = h;
                ctx.putImageData(d3, 0, 0);
                return can;
            }
        }
    });
}
function readBITMAPFILEHEADER(ui8a) {
    this.bfType      = (pipe(ui8a, _read_string(2))); // WORD  bfType;
    console.assert(this.bfType === "BM", "bfType must be equal to \"BM\"");
    this.bfSize      = (pipe(ui8a, _read_ms_dword));  // DWORD bfSize;
    this.bfReserved1 = (pipe(ui8a, _read_ms_word));   // WORD  bfReserved1;
    console.assert(this.bfReserved1 === 0, "bfReserved1 must be equal to 0");
    this.bfReserved2 = (pipe(ui8a, _read_ms_word));   // WORD  bfReserved2;
    console.assert(this.bfReserved2 === 0, "bfReserved2 must be equal to 0");
    this.bfOffBits   = (pipe(ui8a, _read_ms_dword));  // DWORD bfOffBits;
}
function readBITMAPINFO(ui8a) {
    this.bmiHeader = readBITMAPINFOHEADER(ui8a);
    // RGBQUAD          bmiColors[1];
}
function readBITMAPINFOHEADER(ui8a) {
    return {
        biSize         : (pipe(ui8a, _read_ms_dword)), // DWORD biSize,
        biWidth        : (pipe(ui8a, _read_ms_long)),  // LONG  biWidth,
        biHeight       : (pipe(ui8a, _read_ms_long)),  // LONG  biHeight,
        biPlanes       : (pipe(ui8a, _read_ms_word)),  // WORD  biPlanes,
        biBitCount     : (pipe(ui8a, _read_ms_word)),  // WORD  biBitCount,
        biCompression  : (pipe(ui8a, _read_ms_dword)), // DWORD biCompression,
        biSizeImage    : (pipe(ui8a, _read_ms_dword)), // DWORD biSizeImage,
        biXPelsPerMeter: (pipe(ui8a, _read_ms_long)),  // LONG  biXPelsPerMeter,
        biYPelsPerMeter: (pipe(ui8a, _read_ms_long)),  // LONG  biYPelsPerMeter,
        biClrUsed      : (pipe(ui8a, _read_ms_dword)), // DWORD biClrUsed,
        biClrImportant : (pipe(ui8a, _read_ms_dword)), // DWORD biClrImportant,
    };
}
