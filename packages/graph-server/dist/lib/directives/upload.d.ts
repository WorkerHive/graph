import { GraphQLDirective } from "graphql";
import { SchemaComposer } from "graphql-compose";
export declare const directiveName = "upload";
export declare const directive: GraphQLDirective;
export declare const transform: (composer: SchemaComposer<any>) => import("graphql").GraphQLSchema;
