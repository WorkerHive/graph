"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkhubClient = exports.useRealtime = exports.RealtimeSync = exports.useHub = exports.WorkhubProvider = void 0;
const ipfs_1 = require("@workerhive/ipfs");
const yjs_1 = require("./yjs");
Object.defineProperty(exports, "useRealtime", { enumerable: true, get: function () { return yjs_1.useRealtime; } });
Object.defineProperty(exports, "RealtimeSync", { enumerable: true, get: function () { return yjs_1.RealtimeSync; } });
const jwt_decode_1 = __importDefault(require("jwt-decode"));
const react_1 = require("./react");
Object.defineProperty(exports, "WorkhubProvider", { enumerable: true, get: function () { return react_1.WorkhubProvider; } });
Object.defineProperty(exports, "useHub", { enumerable: true, get: function () { return react_1.useHub; } });
const postman_1 = require("./postman");
const actions_1 = require("./actions");
const models_1 = require("./models");
const auth_1 = require("./auth");
const graph_1 = require("./graph");
const ENVIRONMENT = (typeof process !== 'undefined') && (process.release && process.release.name === 'node') ? 'NODE' : 'BROWSER';
let Apollo, gql;
let BoostClient;
let ReactClient;
/*
if(ENVIRONMENT == "NODE"){
    const { ApolloClient, gql } = await import("apollo-boost")
}else{
    const { ApolloClient, gql, InMemoryCache } = await import("@apollo/client");
    const { setContext } = await import('@apollo/client/link/context');
}
*/
const FALLBACK_URL = "rainbow.workhub.services";
class WorkhubClient {
    constructor(url, setup_fn, dispatch) {
        this.lastUpdate = null;
        //public models?: Array<any> = [];
        this.uploadModels = [];
        this.platform = ENVIRONMENT;
        this.query = () => { };
        this.mutation = () => { };
        this.updateBaseURL(url);
        //  this.initClient()
        console.log("Starting hub client with ", this.hubUrl + '/api');
        this.postman = new postman_1.Postman(`${this.hubUrl}/api`);
        let token = localStorage.getItem('token');
        if (token && token.length > 0 && typeof (token) === 'string') {
            this.accessToken = token;
        }
        this.auth = new auth_1.Auth(this, this.postman);
        if (ENVIRONMENT != "NODE") {
            console.info("Turning realtime on");
            this.realtimeSync = new yjs_1.RealtimeSync(this.hostName);
        }
        if (setup_fn) {
            this.setupGraph().then(() => {
                this.models = new models_1.ModelStorage(this);
                this.models.getTypes().then((types) => {
                    this.actionFactory = new actions_1.ActionFactory(this, this.models, dispatch);
                    setup_fn();
                });
            });
        }
    }
    updateBaseURL(url) {
        this.hubUrl = url || 'http://localhost:4002';
        this.hostURL = new URL(this.hubUrl);
        this.hostName = this.hostURL.hostname;
        if (!this.hostName || this.hostName == 'localhost') {
            this.hostName = FALLBACK_URL;
        }
        if (this.postman)
            this.postman.updateBaseURL(url);
    }
    get user() {
        return jwt_decode_1.default(this.accessToken);
    }
    crudAccess(type) {
        return ["read", "create", "update", "delete"].filter((a) => this.canAccess(type, a));
    }
    canAccess(type, action) {
        return this.user.permissions.indexOf(`${type}:${action}`) > -1;
    }
    setAccessToken(token) {
        this.accessToken = token;
    }
    actions(func_name) {
        var _a;
        return (_a = this.actionFactory) === null || _a === void 0 ? void 0 : _a.getFunction(func_name);
    }
    async initIPFS(swarmKey) {
        console.log("INIT IPFS");
        this.swarmKey = swarmKey;
        console.log(globalThis);
        let globalIPFS = window.workhubFS;
        if (globalIPFS) {
            console.log("Existing IPFS found, stopping...");
            await globalIPFS.stop();
        }
        window.workhubFS = new ipfs_1.WorkhubFS({
            Bootstrap: [],
            Swarm: [
                `/dns4/${this.hostName}/tcp/443/wss/p2p-webrtc-star`
            ]
        }, this.swarmKey);
    }
    async setupGraph() {
        this.client = await graph_1.Graph.from(this);
        this.query = this.client.query.bind(this.client);
        this.mutation = this.client.mutation.bind(this.client);
    }
    async setup(dispatch) {
        await this.setupGraph();
        const swarmKey = await this.getSwarmKey();
        await this.initIPFS(swarmKey);
        this.models = new models_1.ModelStorage(this);
        await this.models.getTypes();
        this.actionFactory = new actions_1.ActionFactory(this, this.models, dispatch);
    }
    async getSwarmKey() {
        var _a;
        let result = await ((_a = this.client) === null || _a === void 0 ? void 0 : _a.query(`
                query GetSwarmKey{
                    swarmKey 
                }
            `));
        return result.data.swarmKey;
    }
    setupBasicReads(dispatch) {
        /*
                
                this.models!.push({
                    name: 'IntegrationStore',
                    directives: [],
                    def: [
                        {name: 'id', type: 'ID'},
                        {name: 'name', type: 'String'},
                        {name: 'host', type: 'String'},
                        {name: 'user', type: 'String'},
                        {name: 'pass', type: 'Password'},
                        {name: 'dbName', type: 'String'},
                        {name: 'type', type: 'StoreType'}
                    ]
                })
        
                this.models!.push({
                    name: 'IntegrationMap',
                    directives: [],
                    def: [
                        {name: 'id', type: 'ID'},
                        {name: 'nodes', type: 'JSON'},
                        {name: 'links', type: 'JSON'},
                    ]
                })
        
                this.actions['inviteTeamMember'] = async (id: string) => {
                    let result = await this.mutation(`
                        mutation InviteMember($id: ID){
                            inviteMember(id: $id)
                        }
                    `, {
                        id
                    })
                    return result.data.inviteMember
                }
        
                this.actions['changePassword'] = async (current: string, next: string) => {
                    let result = await this.mutation(`
                        mutation ChangePassword($current: Hash, $next: Hash){
                            changePassword(current: $current, next: $next)
                        }
                    `, {
                        current,
                        next
                    })
                    return result.data.changePassword
                }
        
        
                this.actions['updateType'] = async (name : string, fields : any) => {
                    let result = await this.mutation(`
                        mutation UpdateType($name: String, $fields: JSON){
                            updateMutableType(name: $name, fields: $fields){
                                name
                                directives
                                def
                            }
                        }
                    `, {
                        name,
                        fields
                    })
                    let model_ix = this.models!.map((x) => x.name).indexOf(name)
                    if(model_ix > -1){
                        this.models![model_ix] = result.data.updateMutableType;
                    }
                    return result.data.updateMutableType
                }
        
                this.actions['getIntegrationMap'] = async (id : string) => {
                    console.log("Integration Map", id)
                    let result = await this.query(`
                        query GetIntegrationMap($id: String){
                            integrationMap(id: $id){
                                id
                                nodes
                                links
                            }
                        }
                    `, {
                        id: id
                    })
                    dispatch({type: 'GET_IntegrationMap', id: id, data: result.data.integrationMap})
                    return result.data.integrationMap
                }
        
                this.actions['updateIntegrationMap'] = async (id: string, update: {nodes: any, links: any}) => {
                    let result = await this.mutation(`
                        mutation UpdateIntegrationMap($id: String, $update: IntegrationMapInput){
                            updateIntegrationMap(id: $id, integrationMap: $update){
                                id
                                nodes
                                links
                            }
                        }
                    `, {
                        id,
                        update
                    })
                    dispatch({type: 'UPDATE_IntegrationMap', id: id, data: result.data.updateIntegrationMap})
                    return result.data.updateIntegrationMap;
                }
        
                this.actions['getStoreTypes'] = async () => {
                    let result = await this.query(`
                        query GetStoreTypes{
                            storeTypes {
                                id
                                name
                                description
                            }
                        }
                    `)
                    dispatch({type: `GETS_StoreType`, data: result.data.storeTypes})
                    return result.data.storeTypes;
                }
        
                this.actions['getStoreLayout'] = async (storeName: string) => {
                    let result = await this.query(`
                        query GetStoreLayout ($name: String){
                            storeLayout(storeName: $name)
                        }
                    `, {
                        name: storeName
                    })
                    return result.data.storeLayout;
                }
        
                this.actions['getBucketLayout'] = async (storeName: string, bucketName: string) => {
                    let result = await this.query(`
                        query GetBucketLayout($storeName: String, $bucketName: String){
                            bucketLayout(storeName: $storeName, bucketName: $bucketName)
                        }
                    `, {
                        storeName,
                        bucketName
                    })
                    return result.data.bucketLayout;
                }
        
                this.actions['getIntegrationStores'] = async () => {
                    let result = await this.query(`
                        query GetStores {
                            integrationStores{
                                id
                                name
                                host
                                user
                                pass
                                dbName
                                type
                            }
                        }
                    `)
                    dispatch({type: `GETS_IntegrationStore`, data: result.data.integrationStores})
                    return result.data.integrationStores;
                }
                this.actions['addStore'] = async (store: any) => {
                    let result = await this.mutation(`
                        mutation AddStore($store: IntegrationStoreInput){
                            addIntegrationStore(integrationStore: $store){
                                id
                                name
                                host
                                user
                                pass
                                dbName
                                type
                            }
                        }
                    `, {
                        store: store
                    })
                    dispatch({type: `ADD_IntegrationStore`, data: result.data.addIntegrationStore})
                    return result.data.addIntegrationStore;
                }
                this.actions['updateStore'] = async (id: string, store: any) => {
                    let result = await this.mutation(`
                        mutation UpdateStore($id: String, $store: IntegrationStoreInput) {
                            updateIntegrationStore(id: $id, integrationStore: $store){
                                id
                                name
                                host
                                user
                                pass
                                dbName
                                type
                            }
                        }
                    `, {
                        store: store,
                        id: id
                    })
                    dispatch({type: `UPDATE_IntegrationStore`, data: result.data.updateIntegrationStore, id: id})
                    return result.data.updateIntegrationStore
                }
                this.actions['deleteStore'] = async (id: string) => {
                    let result = await this.mutation(`
                        mutation DeleteStore($id: String){
                            deleteIntegrationStore(id: $id)
                        }
                    `, {
                        id: id
                    })
                    dispatch({type: `DELETE_IntegrationStore`, id: id})
                    return result.data.deleteIntegrationStore;
                }*/
    }
}
exports.WorkhubClient = WorkhubClient;
//# sourceMappingURL=index.js.map