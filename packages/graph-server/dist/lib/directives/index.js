"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.directiveTransforms = exports.directives = void 0;
var input_1 = require("./input");
var upload_1 = require("./upload");
var crud_1 = require("./crud");
var configurable_1 = require("./configurable");
var generate_1 = require("./generate");
exports.directives = __spreadArray([
    input_1.directive,
    upload_1.directive,
    crud_1.directive,
    configurable_1.directive
], generate_1.directives);
exports.directiveTransforms = [
    input_1.transform,
    upload_1.transform,
    crud_1.transform,
    configurable_1.transform
];
