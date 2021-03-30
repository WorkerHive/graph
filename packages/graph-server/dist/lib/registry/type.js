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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = void 0;
var graphql_1 = require("graphql");
var graphql_compose_1 = require("graphql-compose");
var events_1 = __importDefault(require("events"));
var utils_1 = require("../utils");
var scalars_1 = __importDefault(require("../scalars"));
var TypeRegistry = /** @class */ (function (_super) {
    __extends(TypeRegistry, _super);
    function TypeRegistry(typeSDL, resolvers) {
        var _this = _super.call(this) || this;
        _this.composer = graphql_compose_1.schemaComposer;
        _this._sdl = typeSDL;
        _this._resolvers = resolvers;
        _this.setupScalars();
        _this.setupMutable();
        console.log("Starting Type Registry");
        _this.composer.addTypeDefs(typeSDL);
        return _this;
        //Directive types;
    }
    TypeRegistry.prototype.setupScalars = function () {
        var _this = this;
        scalars_1.default.forEach(function (scalar) {
            _this.composer.createScalarTC(scalar);
        });
    };
    TypeRegistry.prototype.setupMutable = function () {
        var _this = this;
        this.composer.addTypeDefs("\n            type MutableType{\n                name: String\n                directives: [String]\n                def: JSON\n            } \n        ");
        this.composer.Query.addFields({
            types: {
                type: 'JSON',
                args: {
                    hasDirective: "[String]"
                },
                resolve: function (parent, _a, context) {
                    var hasDirective = _a.hasDirective;
                    return hasDirective.map(function (directive) {
                        //Get types with directives requested, filter out any types not allowed by the context permissions
                        return utils_1.getTypesWithDirective(_this.composer, directive).map(function (x) { return ({
                            name: x.name,
                            directives: x.directives,
                            def: x.def
                        }); }); //.filter((a) => context.user.permissions.indexOf(`${a.name}:read`) > -1)
                    });
                }
            },
            uploadTypes: {
                type: '[MutableType]',
                resolve: function () {
                    return utils_1.getTypesWithDirective(_this.composer, "upload");
                }
            },
            crudTypes: {
                type: '[MutableType]',
                resolve: function () {
                    return utils_1.getTypesWithDirective(_this.composer, "crud");
                }
            },
            mutableTypes: {
                type: '[MutableType]',
                resolve: function (parent, args, context) {
                    return utils_1.getTypesWithDirective(_this.composer, "configurable");
                }
            },
            mutableInputTypes: {
                type: '[MutableType]',
                resolve: function (parent, args, context) {
                    return _this.inputTypes;
                }
            }
        });
        this.composer.Mutation.addFields({
            addMutableType: {
                args: {
                    name: 'String',
                    def: 'JSON'
                },
                type: 'MutableType',
                resolve: function (parent, args, context) {
                    return _this.registerRawType(args.name, args.def);
                }
            },
            updateMutableType: {
                args: {
                    name: 'String',
                    fields: 'JSON'
                },
                type: 'MutableType',
                resolve: function (parent, args, context) {
                    _this.addFields(args.name, args.fields);
                    return _this.getType(args.name);
                }
            }
        });
        this.emit('add', '');
    };
    Object.defineProperty(TypeRegistry.prototype, "inputTypes", {
        get: function () {
            var _this = this;
            var _types = [];
            this.composer.types.forEach(function (item, key) {
                if (typeof (key) == 'string' && item.getType() instanceof graphql_1.GraphQLInputObjectType) {
                    _types.push(new Type(_this.composer.getITC(key)));
                }
            });
            return _types;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TypeRegistry.prototype, "types", {
        get: function () {
            var _this = this;
            var _types = [];
            this.composer.types.forEach(function (item, key) {
                if (typeof (key) == 'string' && _this.composer.isObjectType(item)) {
                    _types.push(new Type(_this.composer.getOTC(key)));
                }
            });
            return _types;
        },
        enumerable: false,
        configurable: true
    });
    TypeRegistry.prototype.getScalars = function () {
        var _this = this;
        var scalars = [];
        var types = this.composer.types;
        types.forEach(function (type, key) {
            if (typeof (key) === 'string') {
                if (_this.composer.isScalarType(key)) {
                    scalars.push(type.getType());
                }
            }
        });
    };
    TypeRegistry.prototype.addFields = function (typeName, fields) {
        var inputFields = {};
        var objfields = {};
        fields.filter(function (a) { return a.type && a.type.length > 0; }).forEach(function (field) {
            inputFields[field.name] = utils_1.convertInput(field.type);
            objfields[field.name] = field.type;
        });
        this.composer.getITC(typeName + "Input").addFields(__assign({}, inputFields));
        this.composer.getOTC(typeName).addFields(__assign({}, objfields));
        this.emit('add_fields', { typeName: typeName, fields: fields });
    };
    TypeRegistry.prototype.removeFields = function (typeName, fields) {
        var _this = this;
        fields.forEach(function (field) {
            _this.composer.getITC(typeName).removeField(fields);
            _this.composer.getOTC(typeName).removeField(fields);
        });
        this.emit('remove_fields', { typeName: typeName, fields: fields });
    };
    TypeRegistry.prototype.getType = function (name) {
        return new Type(this.composer.getOTC(name));
    };
    TypeRegistry.prototype.registerInputType = function (name, def) {
        var inputType = this.composer.createInputTC({
            name: name,
            fields: __assign({}, def)
        });
        this.emit('add', { name: name, def: def, inputType: inputType });
        return inputType;
    };
    TypeRegistry.prototype.registerRawType = function (name, def) {
        var fields = [];
        for (var k in def) {
            fields.push({ name: k, value: def[k] });
        }
        var typeDef = "\n            type " + name + " {\n                " + fields.map(function (x) { return x.name + ": " + x.value; }).join("\n") + "\n            }\n        ";
        var inputDef = "\n          input " + name + "Input{\n            " + fields.map(function (x) { return x.name + ": " + x.value; }).join("\n") + "\n          }\n        ";
        var input = this.composer.createInputTC(typeDef);
        var obj = this.composer.createObjectTC(typeDef);
        this.emit('add', { typeDef: typeDef });
        return new Type(obj);
    };
    TypeRegistry.prototype.registerType = function (name, def) {
        var _a;
        var queryName = name;
        var obj = this.composer.createObjectTC({
            name: name,
            fields: __assign({}, def)
        });
        this.composer.Mutation.addFields((_a = {},
            _a["add" + queryName] = {
                type: queryName,
                args: __assign({}, def),
                resolve: function (parent, args, context) {
                }
            },
            _a));
        this.emit('add', { name: name, def: def });
        return new Type(obj);
    };
    TypeRegistry.prototype.deregisterType = function (name) {
        var types = this.types.filter(function (a) { return a.name !== name; });
        var sdl = "\n        # \n" + types.map(function (type) {
            return type.sdl;
        }).join("\n");
        this.composer = graphql_compose_1.schemaComposer.clone();
        this.composer.addTypeDefs(sdl);
        this.emit('remove', { name: name });
    };
    Object.defineProperty(TypeRegistry.prototype, "resolvers", {
        get: function () {
            var resolvers = this.composer.getResolveMethods();
            return lodash_1.merge(this._resolvers, resolvers);
            //return r;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TypeRegistry.prototype, "schema", {
        get: function () {
            var outputSchema = this.composer.clone();
            if (this._sdl) {
                outputSchema.addTypeDefs(this._sdl);
            }
            if (this._resolvers)
                outputSchema.addResolveMethods(this._resolvers);
            return outputSchema.buildSchema();
            //    return makeExecutableSchema({typeDefs:this.sdl, resolvers: this.resolvers});
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TypeRegistry.prototype, "sdl", {
        get: function () {
            var sdl = "";
            this.composer.types.forEach(function (type, key) {
                if (typeof (key) == 'string') {
                    sdl += "\n" + type.toSDL();
                }
            });
            return sdl;
        },
        enumerable: false,
        configurable: true
    });
    return TypeRegistry;
}(events_1.default));
exports.default = TypeRegistry;
var camel_case_1 = require("camel-case"); //For future reference this is what being a hippocrit (fuck spelling) is all about
var lodash_1 = require("lodash");
var Type = /** @class */ (function () {
    function Type(object) {
        this.object = object;
        this.name = this.object.getTypeName();
        this.directives = this.object.getDirectives().map(function (x) { return x.name; });
    }
    Object.defineProperty(Type.prototype, "camelName", {
        get: function () {
            return camel_case_1.camelCase(this.name);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Type.prototype, "sdl", {
        get: function () {
            return this.object.toSDL();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Type.prototype, "def", {
        get: function () {
            var _this = this;
            var fields = [];
            if (this.object instanceof graphql_compose_1.InputTypeComposer) {
                fields = this.object.getFields();
            }
            else if (this.object instanceof graphql_compose_1.ObjectTypeComposer) {
                fields = this.object.getType().getFields();
            }
            return utils_1.objectValues(fields).map(function (x) {
                var directives = _this.object.getFieldDirectives(x.name).map(function (x) { return ({
                    name: x.name,
                    args: x.args
                }); });
                return {
                    name: x.name,
                    type: x.type,
                    directives: directives
                };
            });
            /*
            this.object.getFields()
            return objectValues(this.object.getType().getFields() || this.object.getFields()).map((x) => ({
                name: x.name,
                type: x.type
            }))
            */
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Type.prototype, "fields", {
        get: function () {
            var _a;
            var obj = this.object.getType();
            var fields = obj.getFields();
            var output = {};
            for (var k in fields) {
                output[k] = {
                    type: fields[k].type.toString(),
                    //  args: fields[k].args,
                    directives: (_a = fields[k].astNode) === null || _a === void 0 ? void 0 : _a.directives
                };
            }
            return output;
        },
        enumerable: false,
        configurable: true
    });
    return Type;
}());
exports.Type = Type;
