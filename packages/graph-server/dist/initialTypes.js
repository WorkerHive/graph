"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialTypes = void 0;
var initialTypes = function (initialTypes) { return "\ntype Query {\n    empty: String\n}\n\ntype Mutation {\n    empty: String\n}\n\ntype Subscription {\n    empty: String\n}\n" + initialTypes + "\n\n"; };
exports.initialTypes = initialTypes;
