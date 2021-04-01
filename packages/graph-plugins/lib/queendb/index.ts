import { SchemaComposer } from "graphql-compose";
import QueenDB from '@workerhive/queendb';

export const QueenDBPlugin = (db: QueenDB) => {
    return (composer: SchemaComposer<any>, args: { db: QueenDB }) => {

        composer.addTypeDefs(`
        type IntegrationMap @crud{
            id: ID
            nodes: JSON @input
            links: JSON @input
        }

        type IntegrationStore {
            id: ID
            name: String @input
            type: StoreType @input
            host: String @input
            port: Int @input
            dbName: String @input
            user: String @input
            pass: String @input
        }

        type StoreType {
            id: ID @input
            name: String
            description: String
        }
    `)

    let Mutation : any = {};
    let Query : any = {}; 


        Mutation= {
            addIntegrationStore: {
                type: 'IntegrationStore',
                args: {
                    integrationStore: 'IntegrationStoreInput'
                },
                resolve: async (parent : any, { integrationStore } : any, context : any) => {
                    let serverResult = await db.linkServer(integrationStore.name, {
                        host: integrationStore.host,
                        port: integrationStore.port,
                        database: integrationStore.dbName
                    })

                    let userResult = await db.linkUser('postgres', integrationStore.name, { name: integrationStore.user, pass: integrationStore.pass })

                    let importResult = await db.importServer(integrationStore.name);


                    console.log(serverResult, userResult, importResult);
                    return { server: serverResult, user: userResult, import: importResult };

                }
            },
            deleteIntegrationStore: {
                type: 'Boolean',
                args: {
                    id: 'ID'
                },
                resolve: async (parent : any, args : any, context : any) => {
                    //TODO remove store
                }
            }
        }

        Query = {
            storeTypes: {
                type: '[StoreType]',
                resolve: (parent : any, args : any, context : any) => {
                    return [
                        { id: 'mssql', name: "MS-SQL", description: "Microsoft SQL Server" }
                    ]
                }
            },
            stores: {
                type: 'JSON',
                resolve: async (parent : any, args : any, context : any) => {
                    return await db.getServers();
                }
            },
            storeLayout: {
                type: 'JSON',
                args: {
                    storeName: "String"
                },
                resolve: async (parent: any, args : any, context : any) => {
                    return await db.getServerTables(args.storeName);
                }
            },
            bucketLayout: {
                type: 'JSON',
                args: {
                    storeName: 'String',
                    bucketName: 'String'
                },
                resolve: async (parent: any, args : any, context : any) => {
                    return await db.getTableColumns(args.storeName, args.bucketName)
                }
            },
            integrationStore: {
                type: 'IntegrationStore',
                args: {
                    name: 'String'
                },
                resolve: async (parent: any, args : any, context : any) => {
                    const stores: Array<any> = await db.getServers()
                    return stores.filter((a: any) => a.name == args.name);
                }
            },
            integrationStores: {
                type: '[IntegrationStore]',
                resolve: async (parent: any, args : any, context : any) => {
                    return await db.getServers();
                }
            }
        }
        return {
            composer,
            Query,
            Mutation
        }
    }
}