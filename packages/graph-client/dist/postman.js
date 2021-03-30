"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Postman = void 0;
const axios_1 = __importDefault(require("axios"));
class Postman {
    constructor(url) {
        this.axiosInst = axios_1.default.create({
            baseURL: url,
            headers: {}
        });
    }
    updateBaseURL(url) {
        this.axiosInst = axios_1.default.create({
            baseURL: url,
            headers: {}
        });
    }
    get(slug, headers) {
        return this.axiosInst.get(slug, headers);
    }
    post(slug, body, headers) {
        return this.axiosInst.post(slug, body, headers);
    }
}
exports.Postman = Postman;
//# sourceMappingURL=postman.js.map