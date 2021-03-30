"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelStorage = void 0;
class ModelStorage {
    constructor(client) {
        this.types = {}; //Should this be a flat array with a list of directives and a getter?
        this.client = client;
    }
    getByName(name) {
        var _a, _b;
        return (_b = (_a = this.types) === null || _a === void 0 ? void 0 : _a.crud) === null || _b === void 0 ? void 0 : _b.find((a) => a.name == name);
    }
    getByDirective(directive) {
        var _a, _b;
        return (_b = (_a = this.types) === null || _a === void 0 ? void 0 : _a.crud) === null || _b === void 0 ? void 0 : _b.filter((a) => a.directives.indexOf(directive) > -1);
    }
    async getTypes() {
        this.lastUpdate = new Date();
        let result = await this.client.query(`   query GetTypes ($directives: [String]){
                    types(hasDirective: $directives)
                }
            `, {
            directives: ["crud", "upload", "configurable"]
        });
        this.types = { crud: result.data.types[0], upload: result.data.types[1], configurable: result.data.types[2] };
        return this.types;
    }
    map(func) {
        var _a;
        return (_a = this.types) === null || _a === void 0 ? void 0 : _a.crud.map(func);
    }
}
exports.ModelStorage = ModelStorage;
//# sourceMappingURL=index.js.map