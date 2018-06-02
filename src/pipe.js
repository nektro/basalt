//
"use strict";

//
export const pipe = (input, ...methods) => methods.reduce((ac,cv) => cv(ac), input);
export const pipe_async = async (input, ...methods) => await methods.reduce(async (ac,cv) => await cv(ac), input);
