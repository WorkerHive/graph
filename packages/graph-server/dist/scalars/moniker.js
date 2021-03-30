"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonikerScalar = void 0;
var moniker_1 = __importDefault(require("moniker"));
var graphql_1 = require("graphql");
exports.MonikerScalar = new graphql_1.GraphQLScalarType({
    name: 'Moniker',
    description: 'Short name fallback for string',
    parseValue: function (value) {
        if (!value || value.length < 1) {
            return moniker_1.default.choose();
        }
        else {
            return value;
        }
    },
    serialize: function (value) {
        return value;
    },
    parseLiteral: function (ast) {
        if (ast.kind == graphql_1.Kind.STRING) {
            if (!ast.value || ast.value.length < 1) {
                return moniker_1.default.choose();
            }
            else {
                return ast.value;
            }
        }
        return null;
    }
});
