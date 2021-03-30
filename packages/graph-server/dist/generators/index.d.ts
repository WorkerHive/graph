import { GraphQLResolveInfo } from "graphql";
import { GraphContext } from "..";
export declare type GraphQLResolver = (parent: any, args: any, context: GraphContext, info?: GraphQLResolveInfo) => Promise<any>;
export declare type GraphGeneratorAction = (type: string, field: string) => any;
export interface GraphGenerator {
    directiveName: string;
    actions: {
        create?: GraphGeneratorAction;
        update?: GraphGeneratorAction;
    };
}
export declare const applyGenerators: (resolver: GraphQLResolver, generators: Record<string, GraphGeneratorAction>) => (parent: any, args: any, context: GraphContext, info: GraphQLResolveInfo) => Promise<any>;
declare let createGenerators: any;
declare let updateGenerators: any;
export declare const generators: GraphGenerator[];
export { updateGenerators, createGenerators };
export declare const generatorNames: string[];
