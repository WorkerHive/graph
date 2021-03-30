"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uuidMiddleware = void 0;
var uuid_1 = require("uuid");
exports.uuidMiddleware = {
    directiveName: 'uuid',
    actions: {
        create: function (type, field) {
            console.log("UUID ACTION");
            if (field)
                return field;
            return uuid_1.v4();
        },
    }
};
