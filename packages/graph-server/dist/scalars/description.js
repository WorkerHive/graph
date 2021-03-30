"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DescriptionScalar = void 0;
var graphql_1 = require("graphql");
exports.DescriptionScalar = new graphql_1.GraphQLScalarType({
    name: 'Description',
    description: 'Extra string type for form-building multiline text',
    parseValue: function (value) {
        return value;
    },
    serialize: function (value) {
        return value;
    },
    parseLiteral: function (ast) {
        if (ast.kind == graphql_1.Kind.STRING) {
            return ast.value;
        }
        return null;
    }
});
