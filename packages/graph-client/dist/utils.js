"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rawType = exports.cleanObject = exports.isNativeType = void 0;
const nativeTypes = ["Int", "String", "Boolean", "Float", "ID", "JSON", "Date", "Hash", "Moniker", "Timestamp", "Description", "Upload"];
const isNativeType = (typeName) => {
    return nativeTypes.indexOf(typeName) > -1;
};
exports.isNativeType = isNativeType;
const cleanObject = (object, definition) => {
    let returnObject = {};
    definition.forEach((field) => {
        console.log("Clean field", field, object[field.name]);
        if (object[field.name] && field.directives.map((x) => x.name).indexOf('input') > -1)
            returnObject[field.name] = object[field.name];
    });
    return Object.assign({}, returnObject);
};
exports.cleanObject = cleanObject;
const rawType = (typeName) => {
    let type = typeName;
    let matchName = typeName.match(/\[(.*?)\]/);
    if (matchName != null) {
        type = matchName[1];
    }
    return type;
};
exports.rawType = rawType;
//# sourceMappingURL=utils.js.map