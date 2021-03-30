"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashScalar = void 0;
var crypto_1 = __importDefault(require("crypto"));
var graphql_1 = require("graphql");
var HashRegex = /\b[A-Fa-f0-9]{64}\b/;
exports.HashScalar = new graphql_1.GraphQLScalarType({
    name: 'Hash',
    description: 'Sha256 Hash Expressed as a Scalar',
    parseValue: function (value) {
        if (!value.match(HashRegex)) {
            return crypto_1.default.createHash('sha256').update(value).digest('hex');
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
            if (!ast.value.match(HashRegex)) {
                return crypto_1.default.createHash('sha256').update(ast.value).digest('hex');
            }
            else {
                return ast.value;
            }
        }
        return null;
    }
});
