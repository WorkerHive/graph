import { GraphQLDirective } from "graphql";
import { SchemaComposer } from "graphql-compose";
import TypeRegistry from "../registry/type";
export declare const directiveName = "uuid";
export declare const directive: GraphQLDirective;
export declare const transform: (composer: SchemaComposer<any>, typeRegistry?: TypeRegistry | undefined) => SchemaComposer<any>;
