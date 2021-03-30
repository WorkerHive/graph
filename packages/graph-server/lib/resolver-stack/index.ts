import EventEmitter from "events";
import { schemaComposer, SchemaComposer } from "graphql-compose";
import { BaseConnector, BaseGraph } from "..";

export class CRUDResolverStack extends EventEmitter implements BaseConnector{
    protected parent?: BaseGraph | undefined;
    protected schemaFactory: SchemaComposer<any>;

    constructor(){
        super();

        this.schemaFactory = schemaComposer
    }

    setParent(parent: BaseGraph): void {
        throw new Error("Method not implemented.");
    }
    create(type: string, newObject: any): Promise<object> {
        throw new Error("Method not implemented.");
    }
    read(type: string, query: object): Promise<object> {
        throw new Error("Method not implemented.");
    }
    readAll(type: string, query?: object): Promise<object[]> {
        throw new Error("Method not implemented.");
    }
    update(type: string, query: object, update: object): Promise<object> {
        throw new Error("Method not implemented.");
    }
    delete(type: string, query: object): Promise<boolean> {
        throw new Error("Method not implemented.");
    }


}