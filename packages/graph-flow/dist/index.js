"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowConnector = void 0;
var graphql_compose_1 = require("graphql-compose");
var graph_1 = require("../../graph");
//Replace below
var integrationTransform_1 = require("./integrationTransform");
var lodash_1 = require("lodash");
var resolver_base_1 = __importDefault(require("./resolver-base"));
var queendb_1 = __importDefault(require("@workerhive/queendb"));
var FlowConnector = /** @class */ (function (_super) {
    __extends(FlowConnector, _super);
    function FlowConnector(flowDefs, userResolvers) {
        var _this = _super.call(this) || this;
        _this.db = new queendb_1.default({
            host: process.env.QUEENDB_HOST || 'queendb',
            port: 5432,
            database: 'postgres',
            user: 'postgres',
            password: process.env.QUEENDB_PASS || 'defaultpassword'
        });
        _this.flowDefs = flowDefs;
        _this.userResolvers = userResolvers;
        _this.flowResolvers = lodash_1.merge(resolver_base_1.default, userResolvers);
        return _this;
    }
    FlowConnector.prototype.rehydrateFlow = function () {
        return __awaiter(this, void 0, void 0, function () {
            var configurable;
            var _this = this;
            return __generator(this, function (_a) {
                configurable = [];
                this.schemaFactory.types.forEach(function (val, key, map) {
                    if (typeof (key) === 'string' && val instanceof graphql_compose_1.ObjectTypeComposer && val.getDirectiveNames().indexOf('configurable') > -1) {
                        configurable.push(val.toSDL());
                    }
                });
                this.db.on('ready', function () { return __awaiter(_this, void 0, void 0, function () {
                    var flowMap;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                console.log("QueenDB is ready for flow-provider hydration");
                                return [4 /*yield*/, this.db.setupTypeStore(configurable)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, this.db.readCell('IntegrationMap', { id: 'root-map' })];
                            case 2:
                                flowMap = _a.sent();
                                return [4 /*yield*/, this.db.rehydrate(flowMap)];
                            case 3:
                                _a.sent();
                                console.log("Flow Map", flowMap);
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    FlowConnector.prototype.getConfig = function () {
        //Get typedefs and resolvers for integration
        return integrationTransform_1.transform(this.schemaFactory, this.db);
    };
    FlowConnector.prototype.setParent = function (parent) {
        var _this = this;
        this.parent = parent;
        if (parent.typeRegistry.sdl)
            this.schemaFactory.addTypeDefs(parent.typeRegistry.sdl);
        this.parent.on('schema_update', function (schema) {
            _this.schemaFactory = graphql_compose_1.schemaComposer.clone();
            _this.schemaFactory.addTypeDefs(parent.typeRegistry.sdl);
        });
        this.rehydrateFlow();
    };
    FlowConnector.prototype.create = function (type, object) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.addCellRow(type, object)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    FlowConnector.prototype.update = function (type, query, update) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.updateCell(type, query, update)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    FlowConnector.prototype.delete = function (type, query) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.deleteCell(type, query)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    FlowConnector.prototype.read = function (type, query) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.readCell(type, query)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    FlowConnector.prototype.readAll = function (type, query) {
        if (query === void 0) { query = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.readAllCell(type, query)];
            });
        });
    };
    return FlowConnector;
}(graph_1.BaseConnector));
exports.FlowConnector = FlowConnector;
