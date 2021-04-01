import { buildSchema, BuildSchemaOptions, DirectiveLocation, GraphQLBoolean, GraphQLDirective, GraphQLField, GraphQLInputObjectType, GraphQLInputType, GraphQLSchema } from 'graphql';
import { SchemaComposer, ObjectTypeComposer, schemaComposer, InputTypeComposer } from 'graphql-compose';
import { convertInput, getTypesWithDirective, objectValues } from '../utils';
import { EventEmitter } from 'events'

import Scalars from '../scalars';

export default class TypeRegistry extends EventEmitter {

    private _sdl: string;
    private _resolvers: any;

    public composer: SchemaComposer<any> = schemaComposer;

    constructor(typeSDL: string, resolvers: any) {
        super();
        this._sdl = typeSDL;
        this._resolvers = resolvers;
        this.setupScalars();

        this.setupMutable();

        this.composer.addTypeDefs(typeSDL)

        //Directive types;
    }


    applyDirectives(origin_composer: SchemaComposer<any>, directives?: {
        [key: string]: Array<HiveMiddleware>;
    }) {

        let newDirectives: GraphQLDirective[] = [];
        let directiveTransforms: {
            [key: string]: Function;
        } = {};

        //Map out directive set
        for (var k in directives) {
            let d = directives[k].map((dir: any) => dir(k, origin_composer))

            let location = [...new Set(flatten(d.map((x: any) => x.directive.locations)))]
            let description = d.map((x: any) => x.directive.description).join(', ')

            newDirectives.push(new GraphQLDirective({
                name: k,
                description: description,
                locations: location
            }))

            directiveTransforms[k] = flow(d.map((x: any) => x.transform))

        }

        //Add directives
        newDirectives.forEach((directive) => {
            origin_composer.addDirective(directive)
        })

        //Apply directives ltr
        let types = getTypesWithDirective(origin_composer)


        let newQueries = {
            Query: {},
            Mutation: {}
        }

        types.forEach((type) => {
            let otc = origin_composer.getOTC(type.name);

            let rootVal = {
                Query: {},
                Mutation: {}
            };

            let dirs = otc.getDirectiveNames().filter((a) => directiveTransforms[a]);

            dirs.forEach((name) => {
                let { composer, Query, Mutation } = directiveTransforms[name](origin_composer, otc)
                if (composer && composer instanceof SchemaComposer) origin_composer.merge(composer)

                //TODO merge with flow
                rootVal.Query = merge(rootVal.Query, Query)
                rootVal.Mutation = merge(rootVal.Mutation, Mutation)
            })

            //composer.Query.addFields(rootVal.Query)
            //composer.Mutation.addFields(rootVal.Mutation)

            newQueries = merge(newQueries, rootVal)
        })

        return { composer: origin_composer, queries: newQueries }
        //return composer.buildSchema()
        //  console.log(composer)

    }

    applyDirective(directiveName: string, transform: Function) {
        let types = getTypesWithDirective(this.composer, directiveName)
        let composer = schemaComposer.clone()
        console.log(types)
        types.forEach((type) => {
            let otc = composer.getOTC(type.name)
            transform(otc)
        })
        return composer
    }

    setupScalars() {
        Scalars.forEach((scalar) => {
            this.composer.createScalarTC(scalar)
        })
    }

    setupMutable() {
        this.composer.addTypeDefs(`
            type MutableType{
                name: String
                directives: [String]
                def: JSON
            } 
        `)
        this.composer.Query.addFields({
            types: {
                type: 'JSON',
                args: {
                    hasDirective: "[String]"
                },
                resolve: (parent, { hasDirective }, context: GraphContext) => {
                    if (!hasDirective || hasDirective.length < 1) {
                        return getTypesWithDirective(this.composer, '').map((x) => ({
                            name: x.name,
                            directives: x.directives,
                            def: x.def
                        }))
                    } else {
                        return hasDirective.map((directive: string) => {
                            //Get types with directives requested, filter out any types not allowed by the context permissions
                            return getTypesWithDirective(this.composer, directive).map((x) => ({
                                name: x.name,
                                directives: x.directives,
                                def: x.def
                            })) //.filter((a) => context.user.permissions.indexOf(`${a.name}:read`) > -1)
                        })
                    }

                }
            },
            uploadTypes: {
                type: '[MutableType]',
                resolve: () => {
                    return getTypesWithDirective(this.composer, "upload")
                }
            },
            crudTypes: {
                type: '[MutableType]',
                resolve: () => {
                    return getTypesWithDirective(this.composer, "crud")
                }
            },
            mutableTypes: {
                type: '[MutableType]',
                resolve: (parent, args, context) => {
                    return getTypesWithDirective(this.composer, "configurable")
                }
            },
            mutableInputTypes: {
                type: '[MutableType]',
                resolve: (parent, args, context) => {
                    return this.inputTypes;
                }
            }
        })

        this.composer.Mutation.addFields({
            addMutableType: {
                args: {
                    name: 'String',
                    def: 'JSON'
                },
                type: 'MutableType',
                resolve: (parent, args, context) => {
                    return this.registerRawType(args.name, args.def);
                }
            },
            updateMutableType: {
                args: {
                    name: 'String',
                    fields: 'JSON'
                },
                type: 'MutableType',
                resolve: (parent, args, context) => {
                    this.addFields(args.name, args.fields)
                    return this.getType(args.name)
                }
            }
        })

        this.emit('add', '')
    }

    get inputTypes(): Array<Type> {
        let _types: Array<Type> = [];
        this.composer.types.forEach((item, key) => {
            if (typeof (key) == 'string' && item.getType() instanceof GraphQLInputObjectType) {
                _types.push(new Type(this.composer.getITC(key)));
            }
        })
        return _types;
    }

    get types(): Array<Type> {
        let _types: Array<Type> = [];
        this.composer.types.forEach((item, key) => {
            if (typeof (key) == 'string' && this.composer.isObjectType(item)) {
                _types.push(new Type(this.composer.getOTC(key)));
            }
        });
        return _types;
    }
    getScalars() {
        let scalars = [];
        let types = this.composer.types;
        types.forEach((type, key) => {
            if (typeof (key) === 'string') {
                if (this.composer.isScalarType(key)) {
                    scalars.push(type.getType())
                }
            }
        })
    }

    addFields(typeName: string, fields: Array<{ name: string, type: string }>) {
        let inputFields: any = {};
        let objfields: any = {};
        fields.filter((a) => a.type && a.type.length > 0).forEach((field) => {
            inputFields[field.name] = convertInput(field.type)
            objfields[field.name] = field.type
        })
        this.composer.getITC(`${typeName}Input`).addFields({
            ...inputFields
        })
        this.composer.getOTC(typeName).addFields({
            ...objfields
        })
        this.emit('add_fields', { typeName, fields })
    }

    removeFields(typeName: string, fields: Array<string>) {
        fields.forEach(field => {
            this.composer.getITC(typeName).removeField(fields)
            this.composer.getOTC(typeName).removeField(fields)
        })
        this.emit('remove_fields', { typeName, fields })
    }

    getType(name: string): Type {
        return new Type(this.composer.getOTC(name))
    }

    registerInputType(name: string, def: any) {

        let inputType = this.composer.createInputTC({
            name: name,
            fields: {
                ...def
            }
        })
        this.emit('add', { name, def, inputType })

        return inputType
    }

    registerRawType(name: string, def: any) {
        let fields = [];
        for (var k in def) {
            fields.push({ name: k, value: def[k] })
        }
        let typeDef = `
            type ${name} {
                ${fields.map((x) => `${x.name}: ${x.value}`).join(`\n`)}
            }
        `
        let inputDef = `
          input ${name}Input{
            ${fields.map((x) => `${x.name}: ${x.value}`).join(`\n`)}
          }
        `
        let input = this.composer.createInputTC(typeDef)
        let obj = this.composer.createObjectTC(typeDef)
        this.emit('add', { typeDef })
        return new Type(obj)
    }

    registerType(name: string, def: any) {
        let queryName = name;

        let obj = this.composer.createObjectTC({
            name: name,
            fields: {
                ...def,
            }
        })

        this.composer.Mutation.addFields({
            [`add${queryName}`]: {
                type: queryName,
                args: {
                    ...def,
                },
                resolve: (parent, args, context) => {


                }
            }
        })
        this.emit('add', { name, def })
        return new Type(obj);
    }

    deregisterType(name: string) {
        let types = this.types.filter((a) => a.name !== name)
        let sdl = `
        # \n` + types.map((type) => {
            return type.sdl
        }).join(`\n`)

        this.composer = schemaComposer.clone();

        this.composer.addTypeDefs(sdl);

        this.emit('remove', { name })
    }

    get resolvers() {

        let resolvers = this.composer.getResolveMethods();
        return merge(this._resolvers, resolvers);
        //return r;
    }

    get schema(): GraphQLSchema {
        let outputSchema = this.composer.clone();

        if (this._sdl) {

            outputSchema.addTypeDefs(this._sdl)
        }
        //  if(this._resolvers) outputSchema.addResolveMethods(this._resolvers)

        return outputSchema.buildSchema()
        //    return makeExecutableSchema({typeDefs:this.sdl, resolvers: this.resolvers});
    }

    get sdl() {
        let sdl = ``;
        this.composer.types.forEach((type, key) => {
            if (typeof (key) == 'string') {
                sdl += `\n` + type.toSDL();
            }
        })
        return sdl;
    }
}

import { camelCase } from 'camel-case'; //For future reference this is what being a hippocrit (fuck spelling) is all about
import { flatten, flow, merge } from 'lodash';
import { directives } from '../directives';
import GraphContext from '../interfaces/GraphContext';
import { HiveMiddleware } from '..';

export class Type {

    private object: ObjectTypeComposer | InputTypeComposer;

    public name: string;
    public directives: Array<any>;

    constructor(object: ObjectTypeComposer | InputTypeComposer) {
        this.object = object;
        this.name = this.object.getTypeName();
        this.directives = this.object.getDirectives().map((x) => x.name)
    }

    get camelName() {
        return camelCase(this.name);
    }

    get sdl() {
        return this.object.toSDL();
    }

    get def() {
        let fields: Record<any, any> = [];

        if (this.object instanceof InputTypeComposer) {
            fields = (this.object as InputTypeComposer).getFields()
        } else if (this.object instanceof ObjectTypeComposer) {
            fields = this.object.getType().getFields();
        }
        return objectValues(fields).map((x: GraphQLField<any, any>) => {
            const directives = this.object.getFieldDirectives(x.name).map((x: any) => ({
                name: x.name,
                args: x.args
            }));
            return {
                name: x.name,
                type: x.type,
                directives: directives
            }
        });
        /*
        this.object.getFields()
        return objectValues(this.object.getType().getFields() || this.object.getFields()).map((x) => ({
            name: x.name,
            type: x.type
        }))
        */
    }

    get fields() {
        let obj = this.object.getType()
        let fields = obj.getFields();
        let output: any = {};
        for (var k in fields) {
            output[k] = {
                type: fields[k].type.toString(),
                //  args: fields[k].args,
                directives: fields[k].astNode?.directives
            }
        }
        return output;
    }

}
