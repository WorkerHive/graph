"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertInput = exports.isNativeType = exports.getTypesWithFieldDirective = exports.getTypesWithDirective = exports.objectValues = void 0;
var graphql_compose_1 = require("graphql-compose");
var type_1 = require("../registry/type");
function objectValues(obj) {
    return Object.keys(obj).map(function (i) { return obj[i]; });
}
exports.objectValues = objectValues;
function getTypesWithDirective(composer, name) {
    var types = [];
    composer.types.forEach(function (val, key) {
        if (typeof (key) === 'string' && val instanceof graphql_compose_1.ObjectTypeComposer) {
            if (!name || name.length < 1) {
                types.push(new type_1.Type(composer.getOTC(key)));
            }
            else if (val.getDirectives().map(function (x) { return x.name; }).indexOf(name) > -1) {
                types.push(new type_1.Type(composer.getOTC(key)));
            }
        }
    });
    return types;
}
exports.getTypesWithDirective = getTypesWithDirective;
function getTypesWithFieldDirective(composer, name) {
    var types = [];
    composer.types.forEach(function (val, key) {
        if (typeof (key) == 'string' && composer.isObjectType(key)) {
            var fields = composer.getOTC(key).getFields();
            for (var fieldKey in fields) {
                if (composer.getOTC(key).getFieldDirectiveNames(fieldKey).indexOf(name) > -1) {
                    types.push(new type_1.Type(composer.getOTC(key)));
                    break;
                }
            }
            //            val.
        }
    });
    return types;
}
exports.getTypesWithFieldDirective = getTypesWithFieldDirective;
var scalars_1 = __importDefault(require("../scalars"));
var isNativeType = function (type) {
    switch (type) {
        case "Hash":
            return "Hash";
        case "JSON":
            return "JSON";
        case "Date":
            return "Date";
        case "ID":
            return "ID";
        case "String":
            return "String";
        case "Int":
            return "Int";
        case "Float":
            return "Float";
        case "Upload":
            return "Upload";
        case "Boolean":
            return "Boolean";
        default:
            console.log(scalars_1.default.map(function (x) { return x.name; }), type);
            if (scalars_1.default.map(function (x) { return x.name; }).indexOf(type) > -1) {
                return type;
            }
            else {
                return null;
            }
    }
};
exports.isNativeType = isNativeType;
var convertInput = function (type, args) {
    if (args === void 0) { args = { ref: false }; }
    var squareBracketRegex = /\[(.*?)\]/;
    var outputFields = {};
    var newType;
    var bracketMatch = type.match(squareBracketRegex);
    if (!bracketMatch) {
        if (exports.isNativeType(type) != null) {
            newType = type;
        }
        else {
            if (args.ref) {
                newType = 'JSON';
            }
            else {
                newType = type + "Input";
            }
        }
    }
    else {
        var arrType = bracketMatch[1];
        if (exports.isNativeType(arrType) != null) {
            newType = "[" + arrType + "]";
        }
        else {
            if (args.ref) {
                newType = 'JSON';
            }
            else {
                newType = "[" + arrType + "Input]";
            }
        }
    }
    return newType;
};
exports.convertInput = convertInput;
