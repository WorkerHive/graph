import { GraphQLDirective, GraphQLSchema } from "graphql";
import { SchemaComposer } from "graphql-compose";
export declare const directiveName = "crud";
export declare const directive: GraphQLDirective;
export declare function transform(composer: SchemaComposer<any>): GraphQLSchema;
