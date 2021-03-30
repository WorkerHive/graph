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
var generators_1 = require("../generators");
var utils_1 = require("../utils");
exports.directiveName = "crud";
exports.directive = new graphql_1.GraphQLDirective({
    name: exports.directiveName,
    description: "Setup type for automated CRUD",
    locations: [graphql_1.DirectiveLocation.OBJECT],
});
function transform(composer) {
    var _this = this;
    graphql_compose_1.schemaComposer.merge(composer);
    var types = utils_1.getTypesWithDirective(composer, exports.directiveName);
    var addRealtionships = function (item) {
        var otc = graphql_compose_1.schemaComposer.getOTC(item.name);
        var refs = item.def.filter(function (a) { return a.directives.filter(function (x) { return x.name == 'input' && x.args.ref; }).length > 0; });
        refs.forEach(function (foreignKey) {
            var _a;
            otc.addFields((_a = {},
                _a[foreignKey.name] = {
                    type: foreignKey.type.toString(),
                    extensions: {
                        directives: foreignKey.directives
                    },
                    resolve: function (parent, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
                        var arr, name, query, queryK;
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    arr = foreignKey.type.toString().match(/\[(.*?)\]/) != null;
                                    name = arr ? foreignKey.type.toString().match(/\[(.*?)\]/)[1] : foreignKey.type.toString();
                                    query = {};
                                    if (parent[foreignKey.name]) {
                                        queryK = Object.keys(parent[foreignKey.name]);
                                        queryK.forEach(function (k) {
                                            query[k] = arr ? { $in: parent[foreignKey.name][k] } : parent[foreignKey.name][k];
                                        });
                                    }
                                    else {
                                        query = null;
                                    }
                                    return [4 /*yield*/, (arr)];
                                case 1: return [2 /*return*/, (_c.sent()) ? (query != null) ? (_a = context.connector) === null || _a === void 0 ? void 0 : _a.readAll(name, query) : [] : (query != null) ? (_b = context.connector) === null || _b === void 0 ? void 0 : _b.read(name, query) : {}];
                            }
                        });
                    }); }
                },
                _a));
        });
    };
    var hasPermission = function (context, type, perm) {
        return context.permissions.indexOf(type + ":" + perm) > -1;
    };
    types.map(function (item) {
        var _a, _b, _c;
        var args = (_a = {},
            _a[item.camelName] = item.name + "Input",
            _a);
        var addKey = "add" + item.name;
        var updateKey = "update" + item.name;
        var deleteKey = "delete" + item.name;
        var queryKey = "" + item.camelName;
        var queryAllKey = item.camelName + "s";
        addRealtionships(item);
        graphql_compose_1.schemaComposer.Mutation.addFields((_b = {},
            _b[addKey] = {
                type: item.name,
                args: __assign({}, args),
                resolve: generators_1.applyGenerators(function (parent, args, context) { return __awaiter(_this, void 0, void 0, function () {
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                console.log(args);
                                if (!hasPermission(context.user, item.name, 'create')) return [3 /*break*/, 2];
                                return [4 /*yield*/, ((_a = context.connector) === null || _a === void 0 ? void 0 : _a.create(item.name, args[item.camelName]))];
                            case 1: return [2 /*return*/, _b.sent()];
                            case 2: throw new Error(item.name + ":create permission not found");
                        }
                    });
                }); }, generators_1.createGenerators)
            },
            _b[updateKey] = {
                type: item.name,
                args: __assign({ id: 'ID' }, args),
                resolve: generators_1.applyGenerators(function (parent, args, context) { return __awaiter(_this, void 0, void 0, function () {
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                console.log(args);
                                if (!hasPermission(context.user, item.name, 'update')) return [3 /*break*/, 2];
                                return [4 /*yield*/, ((_a = context.connector) === null || _a === void 0 ? void 0 : _a.update(item.name, { id: args['id'] }, args[item.camelName]))];
                            case 1: return [2 /*return*/, _b.sent()];
                            case 2: throw new Error(item.name + ":update permission not found");
                        }
                    });
                }); }, generators_1.updateGenerators)
            },
            _b[deleteKey] = {
                type: 'Boolean',
                args: {
                    id: 'ID'
                },
                resolve: function (parent, _a, context) {
                    var id = _a.id;
                    return __awaiter(_this, void 0, void 0, function () {
                        var _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    if (!hasPermission(context.user, item.name, 'delete')) return [3 /*break*/, 2];
                                    return [4 /*yield*/, ((_b = context.connector) === null || _b === void 0 ? void 0 : _b.delete(item.name, { id: id }))];
                                case 1: return [2 /*return*/, _c.sent()];
                                case 2: throw new Error(item.name + ":delete permission not found");
                            }
                        });
                    });
                }
            },
            _b));
        graphql_compose_1.schemaComposer.Query.addFields((_c = {},
            _c[queryKey] = {
                type: item.name,
                args: {
                    id: 'ID'
                },
                resolve: function (parent, args, context) { return __awaiter(_this, void 0, void 0, function () {
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (!hasPermission(context.user, item.name, 'read')) return [3 /*break*/, 2];
                                return [4 /*yield*/, ((_a = context.connector) === null || _a === void 0 ? void 0 : _a.read(item.name, { id: args['id'] }))];
                            case 1: return [2 /*return*/, _b.sent()];
                            case 2: throw new Error(item.name + ":read permission not found");
                        }
                    });
                }); }
            },
            _c[queryAllKey] = {
                type: "[" + item.name + "]",
                args: {},
                resolve: function (parent, args, context) { return __awaiter(_this, void 0, void 0, function () {
                    var result;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (!hasPermission(context.user, item.name, 'read')) return [3 /*break*/, 2];
                                return [4 /*yield*/, ((_a = context.connector) === null || _a === void 0 ? void 0 : _a.readAll(item.name))];
                            case 1:
                                result = _b.sent();
                                return [2 /*return*/, result];
                            case 2: throw new Error(item.name + ":read permission not found");
                        }
                    });
                }); }
            },
            _c));
    });
    return graphql_compose_1.schemaComposer.buildSchema();
}
exports.transform = transform;
