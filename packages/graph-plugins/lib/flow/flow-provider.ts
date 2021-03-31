import { GraphQLSchema } from 'graphql'
import { ObjectTypeComposer, SchemaComposer, schemaComposer } from 'graphql-compose';

import { BaseConnector, BaseGraph } from '@workerhive/graph';
//Replace below
import { transform as setupConfig } from './integrationTransform'
import {merge} from 'lodash';
import resolvers from './resolver-base'

import QueenDB from '@workerhive/queendb';

export class FlowCRUD extends BaseConnector{

    public db: QueenDB;

    public server: any;

    public typeDefs : any;
    public flowDefs : any;
    public userResolvers: any;

    public flowResolvers: any;

    public schemaOpts: any;

    private timer: any;

    constructor(flowDefs : any, userResolvers : any){
        super();
        
        this.db = new QueenDB({
            host: process.env.QUEENDB_HOST || 'queendb',
            port: 5432,
            database: 'postgres',
            user: 'postgres',
            password: process.env.QUEENDB_PASS || 'defaultpassword'
        })

        this.flowDefs = flowDefs;
        this.userResolvers = userResolvers;
        this.flowResolvers = merge(resolvers, userResolvers)

    }

    async rehydrateFlow(){

        let configurable : any = [];
        this.schemaFactory.types.forEach((val, key, map) => {
            if(typeof(key) === 'string' && val instanceof ObjectTypeComposer && val.getDirectiveNames().indexOf('configurable') > -1){
                configurable.push(val.toSDL())
            }
        })
        
        this.db.on('ready', async () => {
            console.log("QueenDB is ready for flow-provider hydration")
            await this.db.setupTypeStore(configurable)
            const flowMap = await this.db.readCell('IntegrationMap', {id: 'root-map'})
            await this.db.rehydrate(flowMap);
            console.log("Flow Map", flowMap)
        })
    
    }

    getConfig(){
        //Get typedefs and resolvers for integration
        return setupConfig(this.schemaFactory, this.db)
    }

    setParent(parent : any){
        this.parent = parent;

        if(this.parent){
            if(parent.typeRegistry.sdl) this.schemaFactory.addTypeDefs(parent.typeRegistry.sdl)

            this.parent.on('schema_update', (schema) => {
            this.schemaFactory = schemaComposer.clone();
            this.schemaFactory.addTypeDefs(parent.typeRegistry.sdl);
            })

            this.rehydrateFlow()
        }
    }

    async create(type : string, object : any){
        return await this.db.addCellRow(type, object)
    }

    async update(type : string, query : any, update : any){
      
        return await this.db.updateCell(type, query, update)

    }

    async delete(type : string, query: object) : Promise<boolean> {
        return await this.db.deleteCell(type, query) || false
    }

    async read(type : string, query : any){
        return await this.db.readCell(type, query)
    }

    async readAll(type : string, query: object = {}){
        return await this.db.readAllCell(type, query) || [];
    }

}