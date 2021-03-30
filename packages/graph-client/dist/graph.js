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
exports.Graph = void 0;
const apollo_link_http_1 = require("apollo-link-http");
const apollo_cache_inmemory_1 = require("apollo-cache-inmemory");
const apollo_upload_client_1 = require("apollo-upload-client");
const ENVIRONMENT = (typeof process !== 'undefined') && (process.release && process.release.name === 'node') ? 'NODE' : 'BROWSER';
let Apollo, gql;
let BoostClient;
let ReactClient;
const getClient = async () => {
    if (ENVIRONMENT == "NODE") {
        Apollo = await Promise.resolve().then(() => __importStar(require('apollo-boost')));
        BoostClient = Apollo.ApolloClient;
        gql = Apollo.gql;
    }
    else {
        Apollo = await Promise.resolve().then(() => __importStar(require('@apollo/client')));
        ReactClient = Apollo.ApolloClient;
        gql = Apollo.gql;
    }
};
class Graph {
    constructor(client) {
        this.client = client;
        this.hubUrl = client.hubUrl;
        this.setup();
        console.debug('=> Setup client', this.hubUrl);
    }
    static async from(client) {
        await getClient();
        return new Graph(client);
    }
    setup() {
        let opts = {};
        opts.cache = new apollo_cache_inmemory_1.InMemoryCache({
            addTypename: false
        });
        if (ENVIRONMENT == "NODE") {
            opts.link = apollo_link_http_1.createHttpLink({
                uri: `${this.hubUrl}/graphql`,
                headers: {
                    Authorization: this.client.accessToken ? `Bearer ${this.client.accessToken}` : "",
                }
            });
            this.graphClient = new BoostClient(opts);
            console.log("Setup Boost Graph");
        }
        else {
            opts.link = apollo_upload_client_1.createUploadLink({
                uri: `${this.hubUrl}/graphql`,
                headers: {
                    Authorization: this.client.accessToken ? `Bearer ${this.client.accessToken}` : "",
                }
            });
            this.graphClient = new ReactClient(opts);
            console.log("Setup React Graph", this.graphClient);
        }
    }
    async query(query, variables = {}) {
        console.log("Query", this);
        let result = await this.graphClient.query({
            query: gql `${query}`,
            variables: variables
        });
        return result;
    }
    async mutation(query, variables = {}) {
        let result = await this.graphClient.mutate({
            mutation: gql `${query}`,
            variables: variables
        });
        return result;
    }
}
exports.Graph = Graph;
//# sourceMappingURL=graph.js.map