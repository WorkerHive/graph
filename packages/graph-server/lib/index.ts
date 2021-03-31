import GraphTransport from "./interfaces/GraphTransport";
import TypeRegistry from "./registry/type";
import { graphql, execute, GraphQLSchema, parse, Source } from "graphql";
import { schemaComposer } from "graphql-compose";
import { GraphConnector, GraphBase, BaseGraph } from "./interfaces/GraphConnector";
import GraphContext from "./interfaces/GraphContext";
import { getTypesWithDirective } from "./utils";
import BaseConnector from "./interfaces/GraphConnector";
import { merge } from "lodash";
import { directives, directiveTransforms } from './directives';
import { initialTypes } from "./initialTypes";

import { applyGenerators, createGenerators, updateGenerators } from './generators'

export interface HiveMiddleware{

}

export interface HiveGraphOptions{
    types?: string;
    resolvers?: any;
    directives?: {
        [key: string]: Array<HiveMiddleware>;
    }
}

export {
    applyGenerators,
    createGenerators,
    updateGenerators,
    GraphContext,
    BaseGraph,
    BaseConnector,
}

export default class HiveGraph extends BaseGraph{

    private initialTypes : string;
    private resolvers : any;
    private directives?: {
        [key: string]: Array<HiveMiddleware>;
    } = {};

    private context: GraphContext = {};

    public schema: GraphQLSchema;

    private transports : Array<GraphTransport> = [];

    public typeRegistry: TypeRegistry;

    constructor(opts?: HiveGraphOptions){
        super();
        
        this.initialTypes = initialTypes(opts?.types || '')
        this.resolvers = opts?.resolvers
        this.directives = opts?.directives || {};

        this.typeRegistry = new TypeRegistry(this.initialTypes, opts?.resolvers);

        this.schema = this.getSchema()

        this.schemaUpdate = this.schemaUpdate.bind(this);

        this.typeRegistry.on('add', this.schemaUpdate)
        this.typeRegistry.on('remove', this.schemaUpdate)
        this.typeRegistry.on('add_fields', this.schemaUpdate)
        this.typeRegistry.on('remove_fields', this.schemaUpdate)

        //this.connector.setParent(this);
        
       // this.context = {connector: this.connector}

    }

    getSchema(){
        let outputSchema = schemaComposer.clone();

        let typeSchema = this.typeRegistry.schema

        directives.forEach(directive => {
            outputSchema.addDirective(directive)
        })

        directiveTransforms.forEach(transformAction => {
            outputSchema.merge(transformAction(outputSchema, this.typeRegistry))
        })

        let {queries, composer} = this.typeRegistry.applyDirectives(outputSchema, this.directives)
//        outputSchema.merge(composer)
        
        outputSchema.Query.addFields(queries.Query)
        outputSchema.Mutation.addFields(queries.Mutation)

        console.log(outputSchema.Query.toSDL())

         if(this.resolvers) outputSchema.addResolveMethods(this.resolvers)

        outputSchema.merge(typeSchema);
        let schema = outputSchema.buildSchema();

        return schema;
    }

    schemaUpdate(args : any){
        this.schema = this.getSchema();
        this.emit('schema_update', this.typeRegistry.sdl)
    }

    async executeRequest(query : string, variables : any, operationName : string, extraContext?: any){
        let result =  await execute({
            schema: this.schema,
            operationName: operationName,
            document: parse(new Source(query)),
            rootValue: this.typeRegistry.resolvers, 
            contextValue: merge(this.context, extraContext || {}),
            variableValues: variables,
        })

        return result
    }

    //TODO define def type
    addType(name : string, def : any){
        this.typeRegistry.registerType(name, def)
        this.emit('type:add', name)
    }

    removeType(name : string){
        this.typeRegistry.deregisterType(name)
        this.emit('type:remove', name)
    }

    get typeSDL(){
        return this.typeRegistry.sdl;
    }

    addTransport(setupFn : Function){
        this.transports.push(setupFn(this.typeRegistry.sdl))
    }


}