"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionFactory = void 0;
const crud_1 = __importDefault(require("./crud"));
const upload_1 = __importDefault(require("./upload"));
class ActionFactory {
    constructor(client, models, dispatch) {
        var _a, _b, _c;
        this.client = client;
        this.models = models;
        console.debug('Starting Action Manager with ', (_a = this.models.types) === null || _a === void 0 ? void 0 : _a.crud);
        this.actions = crud_1.default((_b = this.models.types) === null || _b === void 0 ? void 0 : _b.crud, client, dispatch);
        this.actions = Object.assign(Object.assign({}, this.actions), upload_1.default((_c = this.models.types) === null || _c === void 0 ? void 0 : _c.upload, client, dispatch));
    }
    getFunction(func) {
        return this.actions[func] || (() => {
            return {};
        });
    }
}
exports.ActionFactory = ActionFactory;
//# sourceMappingURL=index.js.map