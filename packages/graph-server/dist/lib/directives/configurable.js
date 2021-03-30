"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = exports.directive = void 0;
var graphql_1 = require("graphql");
var type_1 = require("../registry/type");
exports.directive = new graphql_1.GraphQLDirective({
    name: 'configurable',
    description: "Type input & ouput flow user configurable",
    locations: [graphql_1.DirectiveLocation.OBJECT],
});
var transform = function (composer, typeRegistry) {
    console.log(new type_1.Type(composer.getOTC('Contact')).def.map(function (x) { return x.directives; }));
    return composer;
};
exports.transform = transform;
