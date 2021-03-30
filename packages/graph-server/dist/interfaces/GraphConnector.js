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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseGraph = void 0;
var events_1 = require("events");
var graphql_compose_1 = require("graphql-compose");
var BaseGraph = /** @class */ (function (_super) {
    __extends(BaseGraph, _super);
    function BaseGraph() {
        return _super.call(this) || this;
    }
    BaseGraph.prototype.getSchema = function () {
        return this.schema;
    };
    return BaseGraph;
}(events_1.EventEmitter));
exports.BaseGraph = BaseGraph;
var BaseConnector = /** @class */ (function (_super) {
    __extends(BaseConnector, _super);
    function BaseConnector() {
        var _this = _super.call(this) || this;
        _this.schemaFactory = graphql_compose_1.schemaComposer;
        return _this;
    }
    BaseConnector.prototype.setParent = function (parent) {
        var _this = this;
        this.parent = parent;
        this.parent.on('schema_update', function (schema) {
            console.info("=> Schema update");
            _this.schemaFactory.merge(schema);
        });
        //this.schemaFactory.merge(this.parent.schema)
    };
    BaseConnector.prototype.create = function (type, newObject) {
        throw new Error("Method not implemented.");
    };
    BaseConnector.prototype.read = function (type, query) {
        throw new Error("Method not implemented.");
    };
    BaseConnector.prototype.readAll = function (type, query) {
        if (query === void 0) { query = {}; }
        throw new Error("Method not implemented.");
    };
    BaseConnector.prototype.update = function (type, query, update) {
        throw new Error("Method not implemented.");
    };
    BaseConnector.prototype.delete = function (type, query) {
        throw new Error("Method not implemented.");
    };
    return BaseConnector;
}(events_1.EventEmitter));
exports.default = BaseConnector;
