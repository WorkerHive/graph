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
exports.transform = void 0;
var graphql_compose_1 = require("graphql-compose");
var typeMap;
var transform = function (schema, db) {
    graphql_compose_1.schemaComposer.merge(schema);
    graphql_compose_1.schemaComposer.createInputTC({
        name: 'IntegrationMapInput',
        fields: {
            nodes: '[JSON]',
            links: '[JSON]'
        }
    });
    graphql_compose_1.schemaComposer.createInputTC({
        name: 'IntegrationStoreInput',
        fields: {
            name: 'String',
            type: 'StoreTypeInput',
            host: 'String',
            port: 'Int',
            dbName: 'String',
            user: 'String',
            pass: 'String'
        }
    });
    graphql_compose_1.schemaComposer.createInputTC({
        name: 'StoreTypeInput',
        fields: {
            id: 'ID'
        }
    });
    graphql_compose_1.schemaComposer.createObjectTC({
        name: 'StoreType',
        fields: {
            id: 'ID',
            name: 'String',
            description: 'String'
        }
    });
    graphql_compose_1.schemaComposer.createObjectTC({
        name: 'IntegrationMap',
        fields: {
            id: 'ID',
            nodes: 'JSON',
            links: 'JSON'
        }
    });
    db.newCell("\n                type IntegrationMap{\n                    id: ID\n                    nodes: JSON\n                    links: JSON\n                }\n            ").then(function () {
        console.log("Integration Map cell should exits");
    });
    graphql_compose_1.schemaComposer.createObjectTC({
        name: 'IntegrationStore',
        fields: {
            id: 'ID',
            name: 'String',
            host: 'String',
            port: 'Int',
            user: 'String',
            pass: 'String',
            dbName: 'String',
            type: 'StoreType'
        }
    });
    graphql_compose_1.schemaComposer.Mutation.addFields({
        addIntegrationMap: {
            type: 'IntegrationMap',
            args: {
                integrationMap: 'IntegrationMapInput'
            },
            resolve: function (parent, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, context.connector.create('IntegrationMap', args.integrationMap)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            }); }
        },
        addIntegrationStore: {
            type: 'IntegrationStore',
            args: {
                integrationStore: 'IntegrationStoreInput'
            },
            resolve: function (parent, _a, context) {
                var integrationStore = _a.integrationStore;
                return __awaiter(void 0, void 0, void 0, function () {
                    var serverResult, userResult, importResult;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, context.connector.db.linkServer(integrationStore.name, {
                                    host: integrationStore.host,
                                    port: integrationStore.port,
                                    database: integrationStore.dbName
                                })];
                            case 1:
                                serverResult = _b.sent();
                                return [4 /*yield*/, context.connector.db.linkUser('postgres', integrationStore.name, { name: integrationStore.user, pass: integrationStore.pass })];
                            case 2:
                                userResult = _b.sent();
                                return [4 /*yield*/, context.connector.db.importServer(integrationStore.name)];
                            case 3:
                                importResult = _b.sent();
                                console.log(serverResult, userResult, importResult);
                                return [2 /*return*/, { server: serverResult, user: userResult, import: importResult }];
                        }
                    });
                });
            }
        },
        updateIntegrationMap: {
            type: 'IntegrationMap',
            args: {
                id: 'ID',
                integrationMap: 'IntegrationMapInput'
            },
            resolve: function (parent, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log(args, "update map");
                            return [4 /*yield*/, context.connector.update('IntegrationMap', { id: args.id }, args.integrationMap)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            }); }
        },
        updateIntegrationStore: {
            type: 'IntegrationStore',
            args: {
                id: 'ID',
                integrationStore: 'IntegrationStoreInput'
            },
            resolve: function (parent, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, context.connector.update('IntegrationStore', { id: args.id }, args.integrationStore)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            }); }
        },
        deleteIntegrationMap: {
            type: 'Boolean',
            args: {
                id: 'String'
            },
            resolve: function (parent, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, context.connector.delete('IntegrationMap', { id: args.id })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            }); }
        },
        deleteIntegrationStore: {
            type: 'Boolean',
            ags: {
                id: 'ID',
            },
            resolve: function (parent, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, context.connector.delete('IntegrationStore', { id: args.id })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            }); }
        }
    });
    graphql_compose_1.schemaComposer.Query.addFields({
        storeTypes: {
            type: '[StoreType]',
            resolve: function (parent, args, context) {
                return [
                    { id: 'mssql', name: "MS-SQL", description: "Microsoft SQL Server" }
                ];
                //TODO    return (context.connector as FlowConnector).stores.getTypes();
            }
        },
        stores: {
            type: 'JSON',
            resolve: function (parent, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, context.connector.db.getServers()];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            }); }
        },
        storeBuckets: {
            type: 'JSON',
            args: {
                name: 'String'
            },
            resolve: function (parent, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/];
                });
            }); }
        },
        storeLayout: {
            type: 'JSON',
            args: {
                storeName: 'String'
            },
            resolve: function (parent, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, context.connector.db.getServerTables(args.storeName)
                            //TODO    return await (context.connector as FlowConnector).stores.get(args.storeName).layout();
                        ];
                        case 1: return [2 /*return*/, _a.sent()
                            //TODO    return await (context.connector as FlowConnector).stores.get(args.storeName).layout();
                        ];
                    }
                });
            }); }
        },
        bucketLayout: {
            type: 'JSON',
            args: {
                storeName: 'String',
                bucketName: 'String'
            },
            resolve: function (parent, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                var conn;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log("Get bucket layout store: " + args.storeName + " bucket: " + args.bucketName);
                            conn = context.connector;
                            return [4 /*yield*/, conn.db.getTableColumns(args.storeName, args.bucketName)
                                //TODO   const store = conn.stores.stores[args.storeName.trim()];
                                //   return await store.bucketLayout(args.bucketName);
                            ];
                        case 1: return [2 /*return*/, _a.sent()
                            //TODO   const store = conn.stores.stores[args.storeName.trim()];
                            //   return await store.bucketLayout(args.bucketName);
                        ];
                    }
                });
            }); }
        },
        integrationMap: {
            type: 'IntegrationMap',
            args: {
                id: 'ID'
            },
            resolve: function (parent, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, context.connector.read('IntegrationMap', { id: args.id })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            }); }
        },
        integrationMaps: {
            type: '[IntegrationMap]',
            resolve: function (parent, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, context.connector.readAll('IntegrationMap')];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            }); }
        },
        integrationStore: {
            type: 'IntegrationStore',
            args: {
                name: 'String'
            },
            resolve: function (parent, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                var stores;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, context.connector.db.getServers()];
                        case 1:
                            stores = _a.sent();
                            return [2 /*return*/, stores.filter(function (a) { return a.name == args.name; })];
                    }
                });
            }); }
        },
        integrationStores: {
            type: '[IntegrationStore]',
            resolve: function (parent, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, context.connector.db.getServers()];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            }); }
        }
    });
    var sdl = graphql_compose_1.schemaComposer.toSDL();
    var resolvers = graphql_compose_1.schemaComposer.getResolveMethods();
    return { types: sdl, resolvers: resolvers };
};
exports.transform = transform;
