"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monikerMiddleware = void 0;
var Moniker = require('moniker');
exports.monikerMiddleware = {
    directiveName: 'moniker',
    actions: {
        create: function (type, field) {
            if (field)
                return field;
            return Moniker.choose();
        },
    }
};
