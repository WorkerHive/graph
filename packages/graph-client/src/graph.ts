import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { createUploadLink } from 'apollo-upload-client'
import { WorkhubClient } from '.'

const ENVIRONMENT = (typeof process !== 'undefined') && (process.release && process.release.name === 'node') ? 'NODE' : 'BROWSER'
let Apollo, gql: any;
let BoostClient: any;
let ReactClient: any;

const parseHeaders = (rawHeaders: any) => {
  const headers = new Headers();
  // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
  // https://tools.ietf.org/html/rfc7230#section-3.2
  const preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, " ");
  preProcessedHeaders.split(/\r?\n/).forEach((line: any) => {
    const parts = line.split(":");
    const key = parts.shift().trim();
    if (key) {
      const value = parts.join(":").trim();
      headers.append(key, value);
    }
  });
  return headers;
};

export const uploadFetch = (url: string, options: any) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      const opts: any = {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: parseHeaders(xhr.getAllResponseHeaders() || "")
      };
      opts.url =
        "responseURL" in xhr
          ? xhr.responseURL
          : opts.headers.get("X-Request-URL");
      const body = "response" in xhr ? xhr.response : (xhr as any).responseText;
      resolve(new Response(body, opts));
    };
    xhr.onerror = () => {
      reject(new TypeError("Network request failed"));
    };
    xhr.ontimeout = () => {
      reject(new TypeError("Network request failed"));
    };
    xhr.open(options.method, url, true);

    Object.keys(options.headers).forEach(key => {
      xhr.setRequestHeader(key, options.headers[key]);
    });

    if (xhr.upload) {
      xhr.upload.onprogress = options.onProgress;
    }

    if(options.onAbortPossible){
       options.onAbortPossible(() => {
          xhr.abort();
        });
    }

    xhr.send(options.body);
  });

const customFetch = (uri: any, options: any) => {
  if (options.onProgress) {
    return uploadFetch(uri, options);
  }
  return fetch(uri, options);
};

const getClient = async () => {
    if (ENVIRONMENT == "NODE") {
        Apollo = await import('apollo-boost');
        BoostClient = Apollo.ApolloClient
        gql = Apollo.gql
    } else {
        Apollo = await import('@apollo/client')
        ReactClient = Apollo.ApolloClient
        gql = Apollo.gql
    }
}
export class Graph{
    private graphClient: any;
    private client: WorkhubClient;
    private hubUrl?: string;

    constructor(client: WorkhubClient){
        this.client = client;
        this.hubUrl = client.hubUrl;
        this.setup()
        console.debug('=> Setup client', this.hubUrl)

    }

    static async from(client: WorkhubClient){
        await getClient();
        return new Graph(client)
    }

    setup(){
        let opts : any = {};
        opts.cache = new InMemoryCache({
            addTypename: false
        })

        if (ENVIRONMENT == "NODE") {
            opts.link = createHttpLink({
                uri: `${this.hubUrl}/graphql`,
                headers: {
                    Authorization: this.client.accessToken ? `Bearer ${this.client.accessToken}` : "",
                }
            })
            this.graphClient = new BoostClient(opts)
            console.log("Setup Boost Graph")
        } else {
            opts.link = createUploadLink({
                uri: `${this.hubUrl}/graphql`,
                fetch: customFetch as any,
                headers: {
                    Authorization: this.client.accessToken ? `Bearer ${this.client.accessToken}` : "",
                }
            })

            this.graphClient = new ReactClient(opts)
            console.log("Setup React Graph", this.graphClient)
        }
    }

    async query(query: string, variables: object = {}) {
        console.log("Query", this)
        let result = await this.graphClient!.query({
            query: gql`${query}`,
            variables: variables
        })
        return result;
    }

    async mutation(query: string, variables: object = {}, context?: {fetchOptions: any}) {
        let result = await this.graphClient!.mutate({
            mutation: gql`${query}`,
            variables: variables,
            context
        })
        return result;
    }



}