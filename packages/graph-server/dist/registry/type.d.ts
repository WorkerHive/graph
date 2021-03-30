/// <reference types="node" />
import { GraphQLSchema } from 'graphql';
import { SchemaComposer, ObjectTypeComposer, InputTypeComposer } from 'graphql-compose';
import EventEmitter from 'events';
export default class TypeRegistry extends EventEmitter {
    private _sdl;
    private _resolvers;
    composer: SchemaComposer<any>;
    constructor(typeSDL: string, resolvers: any);
    setupScalars(): void;
    setupMutable(): void;
    get inputTypes(): Array<Type>;
    get types(): Array<Type>;
    getScalars(): void;
    addFields(typeName: string, fields: Array<{
        name: string;
        type: string;
    }>): void;
    removeFields(typeName: string, fields: Array<string>): void;
    getType(name: string): Type;
    registerInputType(name: string, def: any): InputTypeComposer<any>;
    registerRawType(name: string, def: any): Type;
    registerType(name: string, def: any): Type;
    deregisterType(name: string): void;
    get resolvers(): any;
    get schema(): GraphQLSchema;
    get sdl(): string;
}
export declare class Type {
    private object;
    name: string;
    directives: Array<any>;
    constructor(object: ObjectTypeComposer | InputTypeComposer);
    get camelName(): string;
    get sdl(): string;
    get def(): {
        name: string;
        type: import("graphql").GraphQLOutputType;
        directives: {
            name: any;
            args: any;
        }[];
    }[];
    get fields(): any;
}
