import { GraphQLUpload } from 'graphql-upload';
import { DirectiveLocation } from "graphql";
import { camelCase, ObjectTypeComposer, SchemaComposer } from "graphql-compose";
import { WorkhubFS } from '@workerhive/ipfs'
import { create } from 'lodash';
import { ReadStream } from 'fs';
import { getFields } from '../utils';
import path from 'path';

export const client = (models: any[], client: any, dispatch: any) => {
    let actions: any = {};

    models.forEach((model) => {
        const fields = getFields(models, model)

        actions[`get${model.name}s`] = () => {
            return client!.query(`
                query Get${model.name}s{
                    ${camelCase(model.name)}s{
                        ${fields}
                    }
                }
            `)
        }

        actions[`upload${model.name}`] = (file: File, path?: string) => {
            console.log("Upload args", path)
            return client!.mutation(`
                mutation Upload${model.name}($file: Upload, $path: String){
                    upload${model.name}(file: $file, path: $path) {
                        ${fields}
                    }
                }
            `, {
                file,
                path
            }, {
                fetchOptions: {
                    onProgress: (ev: ProgressEvent) => {
                        console.log("Progress", ev.loaded / ev.total)
                    }
                }
            }).then((r: any) => {
                return r.data[`upload${camelCase(model.name)}`]
            }).then((data: any) => {
                dispatch({ type: `UPLOAD_${model.name}`, data: data })
                return data;
            })
        }

    })

    return actions;
}

export const IPFS: Function = (fs: WorkhubFS) => {
    return (directiveName: string) => {

        const locations = [DirectiveLocation.OBJECT]



        const transform = (composer: SchemaComposer<any>, type: ObjectTypeComposer) => {
            composer.add(GraphQLUpload)

            console.log("IPFS transform")
            const typeName = type.getTypeName();
            const camelName = camelCase(typeName)

            let Query = {
                [`${camelName}`]: {
                    type: typeName,
                    args: {
                        id: 'ID'
                    },
                    resolve: (parent: any, args: any) => {

                    }
                },
                [`${camelName}s`]: {
                    type: `[${typeName}]`,
                    args: {
                        path: 'String'
                    },
                    resolve: async (parent: any, args: any) => {
                        let files = fs.node?.files.ls(args.path || '/')
                        let ls = [];
                        if (files) {
                            for await (const file of files) {
                                ls.push(file)
                            }
                        }
                        return ls.map((x) => ({
                            ...x,
                            path: args.path || '/',
                            type: x.type.toString(),
                            cid: x.cid.toString()
                        }));
                    }
                }
            }

            let Mutation = {
                ['createFolder']: {
                    type: 'String',
                    args: {
                        path: 'String'
                    },
                    resolve: async (parent: any, args: any) => {
                        return await fs.node?.files.mkdir(args.path, { parents: true })
                    }
                },
                [`upload${typeName}`]: {
                    type: typeName,
                    args: {
                        file: 'Upload',
                        path: 'String'
                    },
                    resolve: async (parent: any, args: any) => {
                        console.log(args)
                        return await new Promise(async (resolve, reject) => {
                            const { filename, mimetype, createReadStream } = await args.file;
                            const stream: ReadStream = createReadStream();

                            let buffer = Buffer.from('')

                            stream.on('data', (data: Buffer) => {
                                buffer = Buffer.concat([buffer, data])
                            })

                            stream.on('end', async () => {
                                // console.log(buffer.toString())
                                let result = await fs.node?.add({
                                    path: filename,
                                    content: buffer
                                })

                                const cid = result?.cid.toString();

                                try {
                                    if (args.path) {
                                        console.log("Path supplied", path.join(args.path, filename))
                                        // await fs?.node?.files.rm(args.path) //cheeky hack to make sure write is clean
                                        await fs?.node?.files.write(path.join(args.path, filename), buffer, { create: true, parents: true })
                                    }
                                } catch (e) {
                                    console.error("IPFS upload", e)
                                    reject(e)
                                }
                                //let result = await fs.node?.files.write('/test-2', buffer, {create: true})

                                resolve({ name: filename, path: args.path && args.path, cid: cid })
                            })
                        })

                    }
                }
            }

            return { composer, Query, Mutation }
        }

        return {
            directive: {
                description: "IPFS",
                locations: locations
            },
            transform
        }
    }
}