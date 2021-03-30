"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeMap = exports.RealtimeArray = exports.RealtimeSync = exports.useRealtime = void 0;
const react_1 = __importDefault(require("react"));
const Y = __importStar(require("yjs"));
const y_indexeddb_1 = require("y-indexeddb");
const y_websocket_1 = require("y-websocket");
require("websocket-polyfill");
const utils_1 = require("./utils");
const lodash_1 = require("lodash");
function useRealtime(syncObject, reducer) {
    const [state, setState] = react_1.default.useState(syncObject.toJSON());
    const observer = (event, transaction) => {
        if (!lodash_1.isEqual(syncObject.toJSON(), state)) {
            console.log("Sync Object Observer");
            setState(syncObject.toJSON());
        }
    };
    react_1.default.useEffect(() => {
        if (!lodash_1.isEqual(syncObject.toJSON(), state)) {
            console.log("Sync Object Effect");
            setState(syncObject.toJSON());
        }
        console.log("Setting observer");
        syncObject.observeDeep(observer);
        return () => {
            console.log("Unsetting observer");
            syncObject.unobserveDeep(observer);
        };
    }, [syncObject]);
    const dispatch = (action) => {
        setState(reducer(state, action));
    };
    return [state, dispatch];
}
exports.useRealtime = useRealtime;
class RealtimeSync {
    constructor(url) {
        this.doc = new Y.Doc();
        this.status = '';
        this.websocketProvider = new y_websocket_1.WebsocketProvider(`wss://${url}/yjs`, 'yjs-hub', this.doc);
        this.persistence = new y_indexeddb_1.IndexeddbPersistence('yjs-hub', this.doc);
        this.websocketProvider.on('status', (e) => {
            this.status = e.status;
        });
    }
    pushArray(arrKey, items) {
        const arr = this.doc.getArray(arrKey);
        arr.push(items);
    }
    getArray(key, model) {
        return new RealtimeArray(this.doc.getArray(key), model);
    }
    getMap(key) {
        return new RealtimeMap(this.doc.getMap(key));
    }
}
exports.RealtimeSync = RealtimeSync;
class RealtimeArray {
    constructor(yArray, model) {
        this.array = yArray;
        this.model = model;
    }
    push(content) {
        content = content.map((x) => {
            const clean = utils_1.cleanObject(x, this.model.def);
            console.log("Content", x);
            if (typeof (clean) === 'object') {
                console.log("Object", x);
                Object.keys(clean).map((key) => {
                    console.log("Object key", x, key);
                    if (clean[key] instanceof Date) {
                        clean[key] = clean[key].toString();
                    }
                });
            }
            return x;
        });
        this.array.push(content);
        //  super.push(content)
    }
    toArray() {
        return this.array.toArray().map((obj) => {
            let x = utils_1.cleanObject(obj, this.model.def);
            console.log("Arr obj", x);
            Object.keys(x).map((key) => {
                console.log(this.model, key);
                if (this.model && this.model.def && this.model.def.filter((a) => a.name == key)[0].type == "Date") {
                    x[key] = new Date(x[key]);
                }
            });
            return x;
        });
    }
}
exports.RealtimeArray = RealtimeArray;
class RealtimeMap {
    constructor(yMap) {
        this.map = yMap;
    }
    set(key, value) {
        this.map.set(key, value);
    }
    get(key) {
        this.map.get(key);
    }
    toJSON() {
        return this.map.toJSON();
    }
}
exports.RealtimeMap = RealtimeMap;
//# sourceMappingURL=yjs.js.map