"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimestampScalar = void 0;
var graphql_1 = require("graphql");
exports.TimestampScalar = new graphql_1.GraphQLScalarType({
    name: 'Timestamp',
    description: 'Auto generated timestamp',
    parseValue: function (value) {
        console.log("Value", value);
        if (!value) {
            return new Date().getTime();
        }
        else {
            return new Date(value).getTime();
        }
    },
    serialize: function (value) {
        return value;
    },
    parseLiteral: function (ast) {
        console.log("AST", ast);
        return new Date().getTime();
    }
});
