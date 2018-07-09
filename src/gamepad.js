/**
 * https://github.com/nektro/basalt/blob/master/src/gamepad.js
 */
//
"use strict";
//
window.addEventListener("gamepadconnected",    function(e) { handleGamepadEvent(e.gamepad, true);  });
window.addEventListener("gamepaddisconnected", function(e) { handleGamepadEvent(e.gamepad, false); });

//
const controllers = new Map();
export const target = new (class extends EventTarget { constructor() { super(); } })();

//
function handleGamepadEvent(gamepad, incoming) {
    if (incoming) {
        controllers.set(gamepad.index, [0, [], [[],[]]]);
    }
    else {
        controllers.delete(gamepad.index);
    }
}

function sendEvent(pad, mapping, type, prop, index, value) {
    window.dispatchEvent(new CustomEvent("x-gamepad:change", {
        detail: {
            gamepad: pad,
            mapping,
            type,
            index,
            value
        }
    }));
    target.dispatchEvent(new CustomEvent("change", {
        detail: {
            gamepad: pad,
            mapping,
            type,
            index,
            value
        }
    }));
}

function checkForGamepadData() {
    for (const pad of navigator.getGamepads()) {
        if (pad !== null) {
            const tracker = controllers.get(pad.index);

            if (pad.timestamp !== tracker[0]) {
                tracker[0] = pad.timestamp;

                pad.axes.forEach((v,i) => {
                    if (v !== tracker[1][i]) {
                        tracker[1][i] = v;
                        sendEvent(pad.index, pad.mapping, "axis", "axis", i, v);
                    }
                });
                pad.buttons.forEach((v,i) => {
                    if (v.pressed !== tracker[2][0][i]) {
                        tracker[2][0][i] = v.pressed;
                        sendEvent(pad.index, pad.mapping, "button_press", "button", i, v.pressed);
                    }
                    if (v.value !== tracker[2][1][i]) {
                        tracker[2][1][i] = v.value;
                        sendEvent(pad.index, pad.mapping, "button_swivel", "button", i, v.value);
                    }
                });
            }
        }
    }
    requestAnimationFrame(checkForGamepadData);
}

//
requestAnimationFrame(checkForGamepadData);

//
export const Layouts = Object.freeze({
    standard: {
        axis: {
            JOYSTICK_LEFT_X: 0,
            JOYSTICK_LEFT_Y: 1,
            JOYSTICK_RIGHT_X: 2,
            JOYSTICK_RIGHT_Y: 3
        },
        button: {
            A: 0,
            B: 1,
            X: 2,
            Y: 3,
            L1: 4,
            R1: 5,
            L2: 6,
            R2: 7,
            SELECT: 8,
            START: 9,
            L3: 10,
            R3: 11,
            DPAD_UP: 12,
            DPAD_DOWN: 13,
            DPAD_LEFT: 14,
            DPAD_RIGHT: 15,
            BUTTON_16: 16
        }
    }
});
