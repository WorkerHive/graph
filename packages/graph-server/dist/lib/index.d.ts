import TypeRegistry from "./registry/type";
import { GraphQLSchema } from "graphql";
import { BaseGraph } from "./interfaces/GraphConnector";
import GraphContext from "./interfaces/GraphContext";
import BaseConnector from "./interfaces/GraphConnector";
export { GraphContext, BaseGraph, BaseConnector, };
export default class HiveGraph extends BaseGraph {
    private initialTypes;
    private context;
    schema: GraphQLSchema;
    private transports;
    typeRegistry: TypeRegistry;
    constructor(initial: string | undefined, resolvers: any);
    getSchema(): GraphQLSchema;
    schemaUpdate(args: any): void;
    executeRequest(query: string, variables: any, operationName: string, extraContext?: any): Promise<import("graphql").ExecutionResult<{
        [key: string]: any;
    }, {
        [key: string]: any;
    }>>;
    addType(name: string, def: any): void;
    removeType(name: string): void;
    get typeSDL(): string;
    addTransport(setupFn: Function): void;
}
