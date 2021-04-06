import QueenDB from "@workerhive/queendb"
import { DirectiveLocation } from "graphql"
import { camelCase, ObjectTypeComposer, SchemaComposer } from "graphql-compose"

import { applyGenerators, createGenerators, GraphContext, updateGenerators } from '@workerhive/graph'
import { Type } from "@workerhive/graph/dist/registry/type"
import { cleanObject, getFields, isNativeType, rawType } from "../utils"

export const client = (models: any, client: any, dispatch: any) => {
    let actions : any = {};

     //Takes a type model and iterates over available keys, if key isn't native getFields will be called again to fill out the query fields
   

    const setupAdd = (model: any, fields: any) => {
        actions[`add${model.name}`] = (item: any) => {
            const newObject = cleanObject(item, model.def);

            return client!.mutation(`
                    mutation Add${model.name}($input: ${model.name}Input){
                        add${model.name}(${camelCase(model.name)}: $input){
                            ${fields}
                        }
                    }
                `,
                {
                    input: newObject
                }
            ).then((r: any) => r.data[`add${model.name}`]).then((data: any) => {
                dispatch({ type: `ADD_${model.name}`, data: data })
                return data;
            })
        }
    }

    const setupDelete = (model: any, fields: any) => {
        actions[`delete${model.name}`] = (id: string) => {
            return client!.mutation(`
            mutation Delete${model.name}($id: ID){
                delete${model.name}(id: $id)
            }
        `,{
                    id: id
                }
            ).then((r: any): any => r.data[`delete${model.name}`]).then((data: any) => {
                if (data) dispatch({ type: `DELETE_${model.name}`, id: id })
                return data;
            })
        }
    }

    const setupUpdate = (model: any, fields: any) => {
        actions[`update${model.name}`] = (id: string, update: any) => {

            const updateObject = cleanObject(update, model.def)
            delete updateObject.id;

            return client!.mutation(`
            mutation Update${model.name}($id: ID, $update: ${model.name}Input){
                update${model.name}(${camelCase(model.name)}: $update, id: $id){
                    ${fields}
                }
            }
            `,{
                    id,
                    update: updateObject
                }
            ).then((r: any) => r.data[`update${model.name}`]).then((data: any) => {
                dispatch({ type: `UPDATE_${model.name}`, id: id, data: data })
                return data;
            })
        }
    }

    const setupRead = (model: any, fields: any) => {
        actions[`get${model.name}`] = (id: any, cache: boolean = true) => {
            return client!.query(`
            query Get${model.name}($id: ID){
                ${camelCase(model.name)}(id: $id) {
                    ${fields}
                }
            }
        `,
                {
                    id: id
                }
            ).then((r: any) => r.data[`${camelCase(model.name)}`]).then((data: any) => {
                dispatch({ type: `GET_${model.name}`, id: id, data: data })
                return data;
            })
        }
    }

    const setupReadAll = (model: any, fields: any) => {
        actions[`get${model.name}s`] = (cache: boolean = true) => {
            return client!.query(`
                query Get${model.name}s {
                    ${camelCase(model.name)}s {
                        ${fields}
                    }
                }
                `).then((r: any) => r.data[`${camelCase(model.name)}s`]).then((data: any) => {
                dispatch({ type: `GETS_${model.name}`, data: data })
                return data;
            })
        }
    }

    models.forEach((model: any) => {
        const fields = getFields(models, model)

        setupAdd(model, fields)
        setupDelete(model, fields)
        setupUpdate(model, fields);
        setupRead(model, fields)
        setupReadAll(model, fields)
    })
    console.log(models)


    return actions
}

export const CRUD = (db: QueenDB) => {


    return (directiveName: string, composer: SchemaComposer<any>) => {

        let configurable: any = [];
        composer.types.forEach((val, key, map) => {
            if (typeof (key) === 'string' && val instanceof ObjectTypeComposer && val.getDirectiveNames().indexOf('crud') > -1) {
                configurable.push(val.toSDL())
            }
        })

        db.on('ready', async () => {
            await db.setupTypeStore(configurable)
     
            db.readCell('IntegrationMap', { id: 'root-map' }).then((flowMap) => {
                console.log("Flow Map", flowMap)
                db.rehydrate(flowMap)
            })

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
                            console.log("Query", args)
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