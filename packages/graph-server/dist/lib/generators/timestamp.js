"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timestampMiddleware = void 0;
exports.timestampMiddleware = {
    directiveName: 'timestamp',
    actions: {
        create: function (type, field) {
            if (field)
                return new Date(field).getTime();
            return new Date().getTime();
        }
    }
};
