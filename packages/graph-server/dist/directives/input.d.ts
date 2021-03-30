import { GraphQLDirective, GraphQLSchema } from "graphql";
import { SchemaComposer } from "graphql-compose";
import TypeRegistry from "../registry/type";
export declare const directiveName = "input";
export declare const directive: GraphQLDirective;
export declare function transform(composer: SchemaComposer<any>, typeRegistry: TypeRegistry): GraphQLSchema;
