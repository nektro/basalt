/**
 * https://nektro.github.io/basalt/src/keyboard.js
 */
//
"use strict";
//
window.addEventListener("keydown", (e) => handleKeyboardEvent(e, true));
window.addEventListener("keyup",   (e) => handleKeyboardEvent(e, false));

//
const key_map = new Map();
const keydown_cb_list = new Array();

//
function handleKeyboardEvent(event, down) {
    if (down === true) {
        let flag = false;
        if (!(isKeyDown(event.code))) flag = true;

        key_map.set(event.code, true);

        if (flag) {
            for (const cbf of keydown_cb_list) {
                cbf(event);
            }
        }
    }
    else {
        key_map.set(event.code, false);
    }
}

//
export function isKeyDown(code) {
    if (key_map.has(code)) {
        if (key_map.get(code)) {
            return true;
        }
    }
    return false;
}
export function addKeyDownListener(cb) {
    keydown_cb_list.push(cb);
}

//
export const Keys = Object.freeze({
    Escape: "Escape",
    Digit1: "Digit1",
    Digit2: "Digit2",
    Digit3: "Digit3",
    Digit4: "Digit4",
    Digit5: "Digit5",
    Digit6: "Digit6",
    Digit7: "Digit7",
    Digit8: "Digit8",
    Digit9: "Digit9",
    Digit0: "Digit0",
    Minus: "Minus",
    Equal: "Equal",
    Backspace: "Backspace",
    Tab: "Tab",
    KeyQ: "KeyQ",
    KeyW: "KeyW",
    KeyE: "KeyE",
    KeyR: "KeyR",
    KeyT: "KeyT",
    KeyY: "KeyY",
    KeyU: "KeyU",
    KeyI: "KeyI",
    KeyO: "KeyO",
    KeyP: "KeyP",
    BracketLeft: "BracketLeft",
    BracketRight: "BracketRight",
    Enter: "Enter",
    ControlLeft: "ControlLeft",
    KeyA: "KeyA",
    KeyS: "KeyS",
    KeyD: "KeyD",
    KeyF: "KeyF",
    KeyG: "KeyG",
    KeyH: "KeyH",
    KeyJ: "KeyJ",
    KeyK: "KeyK",
    KeyL: "KeyL",
    Semicolon: "Semicolon",
    Quote: "Quote",
    Backquote: "Backquote",
    ShiftLeft: "ShiftLeft",
    Backslash: "Backslash",
    KeyZ: "KeyZ",
    KeyX: "KeyX",
    KeyC: "KeyC",
    KeyV: "KeyV",
    KeyB: "KeyB",
    KeyN: "KeyN",
    KeyM: "KeyM",
    Comma: "Comma",
    Period: "Period",
    Slash: "Slash",
    ShiftRight: "ShiftRight",
    NumpadMultiply: "NumpadMultiply",
    AltLeft: "AltLeft",
    Space: "Space",
    CapsLock: "CapsLock",
    F1: "F1",
    F2: "F2",
    F3: "F3",
    F4: "F4",
    F5: "F5",
    F6: "F6",
    F7: "F7",
    F8: "F8",
    F9: "F9",
    F10: "F10",
    NumLock: "NumLock",
    ScrollLock: "ScrollLock",
    Numpad7: "Numpad7",
    Numpad8: "Numpad8",
    Numpad9: "Numpad9",
    NumpadSubtract: "NumpadSubtract",
    Numpad4: "Numpad4",
    Numpad5: "Numpad5",
    Numpad6: "Numpad6",
    NumpadAdd: "NumpadAdd",
    Numpad1: "Numpad1",
    Numpad2: "Numpad2",
    Numpad3: "Numpad3",
    Numpad0: "Numpad0",
    NumpadDecimal: "NumpadDecimal",
    Unidentified: "Unidentified",
    IntlBackslash: "IntlBackslash",
    F11: "F11",
    F12: "F12",
    IntlRo: "IntlRo",
    Convert: "Convert",
    KanaMode: "KanaMode",
    NonConvert: "NonConvert",
    NumpadEnter: "NumpadEnter",
    ControlRight: "ControlRight",
    NumpadDivide: "NumpadDivide",
    PrintScreen: "PrintScreen",
    AltRight: "AltRight",
    Home: "Home",
    ArrowUp: "ArrowUp",
    PageUp: "PageUp",
    ArrowLeft: "ArrowLeft",
    ArrowRight: "ArrowRight",
    End: "End",
    ArrowDown: "ArrowDown",
    PageDown: "PageDown",
    Insert: "Insert",
    Delete: "Delete",
    AudioVolumeMute: "AudioVolumeMute",
    AudioVolumeDown: "AudioVolumeDown",
    AudioVolumeUp: "AudioVolumeUp",
    Power: "Power",
    NumpadEqual: "NumpadEqual",
    Pause: "Pause",
    NumpadComma: "NumpadComma",
    Lang1: "Lang1",
    Lang2: "Lang2",
    IntlYen: "IntlYen",
    MetaLeft: "MetaLeft",
    MetaRight: "MetaRight",
    ContextMenu: "ContextMenu",
    BrowserStop: "BrowserStop",
    Again: "Again",
    Props: "Props",
    Undo: "Undo",
    Select: "Select",
    Copy: "Copy",
    Open: "Open",
    Paste: "Paste",
    Find: "Find",
    Cut: "Cut",
    Help: "Help",
    Sleep: "Sleep",
    WakeUp: "WakeUp",
    LaunchApp1: "LaunchApp1",
    BrowserFavorites: "BrowserFavorites",
    BrowserBack: "BrowserBack",
    BrowserForward: "BrowserForward",
    Eject: "Eject",
    MediaTrackNext: "MediaTrackNext",
    MediaPlayPause: "MediaPlayPause",
    MediaTrackPrevious: "MediaTrackPrevious",
    MediaStop: "MediaStop",
    BrowserRefresh: "BrowserRefresh",
    F13: "F13",
    F14: "F14",
    F15: "F15",
    F16: "F16",
    F17: "F17",
    F18: "F18",
    F19: "F19",
    F20: "F20",
    F21: "F21",
    F22: "F22",
    F23: "F23",
    F24: "F24",
    BrowserSearch: "BrowserSearch",
    Fn: "Fn"
});
