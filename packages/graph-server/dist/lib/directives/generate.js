"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.directives = void 0;
var graphql_1 = require("graphql");
var generators_1 = require("../generators");
exports.directives = generators_1.generators.map(function (x) {
    return new graphql_1.GraphQLDirective({
        name: x.directiveName,
        description: 'Generated directive for generators',
        locations: [graphql_1.DirectiveLocation.FIELD_DEFINITION]
    });
});
