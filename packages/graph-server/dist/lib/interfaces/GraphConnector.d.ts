/// <reference types="node" />
import { EventEmitter } from "events";
import { GraphQLSchema } from "graphql";
import { SchemaComposer } from "graphql-compose";
export interface GraphBase {
    schema: GraphQLSchema | undefined;
    getSchema(): GraphQLSchema | undefined;
}
export interface GraphConnector {
    setParent(parent: GraphBase): void;
    create(type: string, newObject: any): Promise<object>;
    read(type: string, query: object): Promise<object>;
    readAll(type: string, query?: object): Promise<Array<object>>;
    update(type: string, query: object, update: object): Promise<object>;
    delete(type: string, query: object): Promise<boolean>;
}
export declare class BaseGraph extends EventEmitter implements GraphBase {
    schema: GraphQLSchema | undefined;
    constructor();
    getSchema(): GraphQLSchema | undefined;
}
export default class BaseConnector extends EventEmitter implements GraphConnector {
    protected parent?: BaseGraph;
    protected schemaFactory: SchemaComposer<any>;
    constructor();
    setParent(parent: BaseGraph): void;
    create(type: string, newObject: any): Promise<object>;
    read(type: string, query: object): Promise<object>;
    readAll(type: string, query?: object): Promise<object[]>;
    update(type: string, query: object, update: object): Promise<object>;
    delete(type: string, query: object): Promise<boolean>;
}
