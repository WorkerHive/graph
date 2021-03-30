"use strict";
/*
    UUID Directive to generate v4 uuid given an empty field

*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = exports.directive = exports.directiveName = void 0;
var graphql_1 = require("graphql");
var graphql_compose_1 = require("graphql-compose");
var utils_1 = require("../utils");
exports.directiveName = "uuid";
exports.directive = new graphql_1.GraphQLDirective({
    name: exports.directiveName,
    description: "Generate uuid for empty field",
    locations: [graphql_1.DirectiveLocation.FIELD_DEFINITION]
});
var transform = function (composer, typeRegistry) {
    //  console.log(new Type(composer.getOTC('Contact')).def.map((x) => x.directives))
    graphql_compose_1.schemaComposer.merge(composer);
    var types = utils_1.getTypesWithFieldDirective(graphql_compose_1.schemaComposer, exports.directiveName);
    types.map(function (x) {
        var fields = x.def.filter(function (a) { return a.directives.filter(function (a) { return a.name == exports.directiveName; }).length > 0; });
        var otc = graphql_compose_1.schemaComposer.getOTC(x.name);
        fields.forEach(function (field) {
            var config = otc.getFieldConfig(field.name);
            console.log(config.resolve);
        });
        //   console.log("Type", x.name, fields)
    });
    //  console.log("Types with uuid field", types)
    return composer;
};
exports.transform = transform;
