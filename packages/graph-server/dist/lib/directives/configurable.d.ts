import { GraphQLDirective } from "graphql";
import { SchemaComposer } from "graphql-compose";
import TypeRegistry from "../registry/type";
export declare const directive: GraphQLDirective;
export declare const transform: (composer: SchemaComposer<any>, typeRegistry: TypeRegistry) => SchemaComposer<any>;
