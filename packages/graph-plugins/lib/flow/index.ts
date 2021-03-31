import QueenDB from "@workerhive/queendb"
import { DirectiveLocation } from "graphql"
import { camelCase, ObjectTypeComposer, SchemaComposer } from "graphql-compose"

import { applyGenerators, createGenerators, GraphContext, updateGenerators } from '@workerhive/graph'
import { Type } from "@workerhive/graph/dist/registry/type"

export const CRUD = (db: QueenDB) => {


    return (directiveName: string, composer: SchemaComposer<any>) => {
        composer.addTypeDefs(`
            input IntegrationMapInput{
                nodes: JSON
                links: JSON
            }
            type IntegrationMap @crud{
                id: ID
                nodes: JSON
                links: JSON
            }
        `)

        let configurable: any = [];
        composer.types.forEach((val, key, map) => {
            if (typeof (key) === 'string' && val instanceof ObjectTypeComposer && val.getDirectiveNames().indexOf('crud') > -1) {
                configurable.push(val.toSDL())
            }
        })

        db.setupTypeStore(configurable)
        db.readCell('IntegrationMap', { id: 'root-map' }).then((flowMap) => {
            db.rehydrate(flowMap)
        })

        const locations = [DirectiveLocation.OBJECT]

        const addRealtionships = (otc: ObjectTypeComposer) => {
            let item = new Type(otc)
            const refs = item.def.filter((a: any) => a.directives.filter((x: any) => x.name == 'input' && x.args.ref).length > 0)

            refs.forEach((foreignKey: any) => {
                otc.addFields({
                    [foreignKey.name]: {
                        type: foreignKey.type.toString(),
                        extensions: {
                            directives: foreignKey.directives
                        },
                        resolve: async (parent, args, context: any, info) => {
                            let arr = foreignKey.type.toString().match(/\[(.*?)\]/) != null;
                            let name = arr ? foreignKey.type.toString().match(/\[(.*?)\]/)[1] : foreignKey.type.toString();

                            let query: any = {};

                            if (parent[foreignKey.name]) {
                                let queryK = Object.keys(parent[foreignKey.name])
                                queryK.forEach(k => {
                                    query[k] = arr ? { $in: parent[foreignKey.name][k] } : parent[foreignKey.name][k]
                                })
                            } else {
                                query = null;
                            }


                            return await (arr) ? (query != null) ? db.readAllCell(name, query) : [] : (query != null) ? db.readCell(name, query) : {}
                        }
                    }
                })

            })
        }

        const hasPermission = (context: { permissions: string[] }, type: string, perm: string) => {
            return context && context.permissions && context.permissions.indexOf(`${type}:${perm}`) > -1
        }

        const transform = (composer: SchemaComposer<any>, type: ObjectTypeComposer) => {
            console.log("CRUD transform")

            const typeName = type.getTypeName()
            const camelName = camelCase(typeName)

            const args = {
                [camelName]: `${typeName}Input`
            }

            const addKey = `add${typeName}`
            const updateKey = `update${typeName}`
            const deleteKey = `delete${typeName}`

            const queryKey = `${camelName}`
            const queryAllKey = `${camelName}s`

            addRealtionships(type)

            return {
                composer,
                Mutation: {
                    [addKey]: {
                        type: typeName,
                        args: {
                            ...args
                        },
                        resolve: applyGenerators(async (parent: any, args: any, context: any) => {
                            if (hasPermission(context.user, typeName, 'create')) {
                                return await db.addCellRow(typeName, args[camelName])
                            } else {
                                throw new Error(`${typeName}:create permission not found`)
                            }
                        }, createGenerators)
                    },
                    [updateKey]: {
                        type: typeName,
                        args: {
                            id: "ID",
                            ...args
                        },
                        resolve: applyGenerators(async (parent: any, args: any, context: any) => {
                            if (hasPermission(context.user, typeName, 'update')) {
                                return await db.updateCell(typeName, { id: args.id }, args[camelName])
                            } else {
                                throw new Error(`${typeName}:update permission not found`)
                            }
                        }, updateGenerators)
                    },
                    [deleteKey]: {
                        type: 'Boolean',
                        args: {
                            id: 'ID'
                        },
                        resolve: async (parent: any, args: any, context: any) => {
                            if (hasPermission(context.user, typeName, 'delete')) {
                                return await db.deleteCell(typeName, { id: args.id })
                            } else {
                                throw new Error(`${typeName}:delete permission not found`)
                            }
                        }
                    }
                },
                Query: {
                    [queryAllKey]: {
                        type: `[${typeName}]`,
                        resolve: async (parent: any, args: any, context: any) => {
                            if (hasPermission(context.user, typeName, 'read')) {
                                return await db.readAllCell(typeName, {})
                            } else {
                                throw new Error(`${typeName}:read permission not found`)
                            }
                        }
                    },
                    [queryKey]: {
                        type: typeName,
                        args: {
                            id: 'ID'
                        },
                        resolve: async (parent: any, args: any, context: any) => {
                            if (hasPermission(context.user, typeName, 'read')) {
                                return await db.readCell(typeName, { id: args.id })
                            } else {
                                throw new Error(`${typeName}:read permission not found`)
                            }
                        }
                    }
                }
            }
        }

        return {
            directive: {
                description: "CRUD",
                locations: locations
            },
            transform
        }
    }
}