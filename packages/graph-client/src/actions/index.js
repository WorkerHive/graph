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
exports.__esModule = true;
exports.ActionFactory = void 0;
var crud_1 = require("./crud");
var upload_1 = require("./upload");
var ActionFactory = /** @class */ (function () {
    function ActionFactory(client, models, dispatch) {
        var _a, _b, _c;
        this.client = client;
        this.models = models;
        console.debug('Starting Action Manager with ', (_a = this.models.types) === null || _a === void 0 ? void 0 : _a.crud);
        this.actions = crud_1["default"]((_b = this.models.types) === null || _b === void 0 ? void 0 : _b.crud, client, dispatch);
        this.actions = __assign(__assign({}, this.actions), upload_1["default"]((_c = this.models.types) === null || _c === void 0 ? void 0 : _c.upload, client, dispatch));
    }
    ActionFactory.prototype.getFunction = function (func) {
        return this.actions[func] || (function () {
            return {};
        });
    };
    return ActionFactory;
}());
exports.ActionFactory = ActionFactory;
