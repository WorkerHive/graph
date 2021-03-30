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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHub = exports.useHubHook = exports.WorkhubProvider = void 0;
const react_1 = __importStar(require("react"));
const _1 = require(".");
const store_1 = require("./store");
const HubContext = react_1.default.createContext([undefined, {}, false, null]);
const WorkhubProvider = ({ children, token, url }) => {
    const [hub, store, isReady, err] = exports.useHubHook(url, token || '');
    return (react_1.default.createElement(HubContext.Provider, { value: [hub, store, isReady, err] }, typeof (children) === 'function' ? children(hub, store, isReady, err) : children));
};
exports.WorkhubProvider = WorkhubProvider;
const useHubHook = (url, token) => {
    const [hubUrl, setUrl] = react_1.default.useState('');
    const [client, setClient] = react_1.default.useState();
    const [isReady, setReady] = react_1.default.useState(false);
    const [error, setError] = react_1.default.useState(null);
    const [{ store }, dispatch] = react_1.default.useReducer(store_1.clientReducer, { store: {} });
    react_1.useEffect(() => {
        async function startClient(url, token) {
            console.log("Start client");
            try {
                if (window.hubClient) {
                    console.log("Existing hub client", window.hubClient);
                    window.hubClient.setAccessToken(token);
                    setClient(window.hubClient);
                    setReady(true);
                    /*  if(!window.hubClient.models?.lastUpdate || window.hubClient.models.lastUpdate?.getTime() < new Date().getTime() - 15 * 60 * 1000){
                          console.log("Starting hub client")
                          window.hubClient.setup(dispatch).then(() => {
                              //Maybe check time since last update?
                              setClient(window.hubClient as WorkhubClient)
                              setReady(true)
                          })
                      
                      }*/
                }
                else {
                    let cli = new _1.WorkhubClient(url);
                    cli.setAccessToken(token);
                    cli.setup(dispatch).then(() => {
                        window.hubClient = cli;
                        setClient(cli);
                        setReady(true);
                    });
                }
                setError(null);
            }
            catch (e) {
                console.error("Error setting up client", e);
                setClient(undefined);
                setReady(false);
                setError(e);
            }
        }
        async function stopClient() {
            console.log("Stop client");
            setClient(undefined);
            setReady(false);
            setError(null);
        }
        console.log(url, setClient, setError, setReady);
        if (hubUrl != url) {
            console.log("URL", url, hubUrl);
            setUrl(url);
            stopClient().then(() => startClient(url, token));
        }
        return () => {
            //stopClient();
        };
    }, [url, hubUrl, setUrl, window]);
    return [client, store, isReady, error];
};
exports.useHubHook = useHubHook;
const useHub = () => {
    const context = react_1.useContext(HubContext);
    return context;
};
exports.useHub = useHub;
//# sourceMappingURL=react.js.map