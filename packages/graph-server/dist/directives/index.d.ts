import { transform as inputTransform } from './input';
export declare const directives: import("graphql").GraphQLDirective[];
export declare const directiveTransforms: (((composer: import("graphql-compose").SchemaComposer<any>, typeRegistry: import("../registry/type").default) => import("graphql-compose").SchemaComposer<any>) | typeof inputTransform)[];
