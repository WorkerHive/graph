"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = exports.directive = exports.directiveName = void 0;
var graphql_1 = require("graphql");
var graphql_compose_1 = require("graphql-compose");
var graphql_upload_1 = require("graphql-upload");
var utils_1 = require("../utils");
//import { CID } from 'ipfs-core';
var type_1 = require("../registry/type");
var generators_1 = require("../generators");
exports.directiveName = "upload";
exports.directive = new graphql_1.GraphQLDirective({
    name: exports.directiveName,
    description: "Type is a transformation on file upload",
    locations: [graphql_1.DirectiveLocation.OBJECT],
});
var transform = function (composer) {
    graphql_compose_1.schemaComposer.merge(composer);
    graphql_compose_1.schemaComposer.add(graphql_upload_1.GraphQLUpload);
    console.info('=> Added Upload Scalar');
    var types = utils_1.getTypesWithDirective(composer, exports.directiveName);
    types.forEach(function (type) {
        var _a, _b;
        var queryKey = type.camelName + "s";
        var addKey = "add" + type.name;
        var deleteKey = "delete" + type.name;
        graphql_compose_1.schemaComposer.Query.addFields((_a = {},
            _a[queryKey] = {
                type: "[" + type.name + "]",
                resolve: function (parent, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, context.connector.readAll(type.name)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                }); }
            },
            _a));
        graphql_compose_1.schemaComposer.Mutation.addFields((_b = {},
            _b[addKey] = {
                type: type.name,
                args: {
                    cid: 'String',
                    filename: 'String',
                },
                resolve: generators_1.applyGenerators(function (parent, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/];
                    });
                }); }, generators_1.createGenerators)
            },
            _b[deleteKey] = {
                type: type.name,
                args: {
                    id: 'ID'
                },
                resolve: function (parent, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, context.connector.delete(type.name, { id: args.id })];
                            case 1: 
                            //TODO delete from fsLayer
                            return [2 /*return*/, _a.sent()];
                        }
                    });
                }); }
            },
            _b));
    });
    console.log(new type_1.Type(graphql_compose_1.schemaComposer.getOTC('Contact')).def.map(function (x) { return x.directives; }));
    return graphql_compose_1.schemaComposer.buildSchema();
};
exports.transform = transform;
