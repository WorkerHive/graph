"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = exports.directive = exports.directiveName = void 0;
var graphql_1 = require("graphql");
var graphql_compose_1 = require("graphql-compose");
var generators_1 = require("../generators");
var utils_1 = require("../utils");
exports.directiveName = "input";
exports.directive = new graphql_1.GraphQLDirective({
    name: exports.directiveName,
    description: "Field is a component of it's sibling input type",
    locations: [graphql_1.DirectiveLocation.FIELD_DEFINITION],
    args: {
        ref: {
            type: graphql_1.GraphQLBoolean,
            description: "input is a reference to type",
            defaultValue: false
        },
        required: {
            type: graphql_1.GraphQLBoolean,
            description: "required for input type of same name",
            defaultValue: false
        }
    }
});
function transform(composer, typeRegistry) {
    graphql_compose_1.schemaComposer.merge(composer);
    var types = utils_1.getTypesWithFieldDirective(graphql_compose_1.schemaComposer, exports.directiveName);
    var outputTypes = types.map(function (inputType) {
        var otc = graphql_compose_1.schemaComposer.getOTC(inputType.name);
        var inputFields = [];
        var generatedFields = [];
        for (var k in inputType.fields) {
            var field = Object.assign({}, inputType.fields[k]);
            field.name = k;
            inputFields.push(field);
        }
        generatedFields = inputFields.filter(function (field) { return otc.getFieldDirectiveNames(field.name).filter(function (directive) { return generators_1.generatorNames.indexOf(directive) > -1; }).length > 0; });
        inputFields = inputFields.filter(function (field) { return otc.getFieldDirectiveNames(field.name).filter(function (directive) { return directive.indexOf(exports.directiveName) > -1; }).length > 0; });
        var inputFieldObj = {};
        generatedFields.forEach(function (field) {
            inputFieldObj[field.name] = {
                type: field.type,
                extensions: {
                    directives: field.directives.map(function (x) { return ({
                        name: x.name.value,
                        args: x.args || {}
                    }); })
                }
            };
        });
        inputFields.forEach(function (f) {
            var directives = f.directives.map(function (x) {
                var args = {};
                (x.arguments || []).forEach(function (y) {
                    args[y.name.value] = y.value.value;
                });
                return {
                    name: x.name.value,
                    args: args
                };
            });
            var inputDirective = directives.filter(function (a) { return a.name == 'input'; })[0];
            inputFieldObj[f.name] = utils_1.convertInput(f.type, inputDirective.args);
        });
        return composer.createInputTC({
            name: inputType.name + "Input",
            fields: __assign({}, inputFieldObj)
        });
    });
    //console.log("Output", schemaComposer.getITC("ProjectInput").toSDL())
    return graphql_compose_1.schemaComposer.buildSchema();
}
exports.transform = transform;
