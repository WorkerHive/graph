import { WorkhubClient } from "..";

export class ModelStorage {
    private client: WorkhubClient;

    public lastUpdate?: Date;
    
    public types?: Array<any> = []; //Should this be a flat array with a list of directives and a getter?

    constructor(client: WorkhubClient){
        this.client = client;

    }


    getByName(name: string){
        return this.types?.find((a: any) => a.name == name)
    }

    getByDirective(directive: string){
        return this.types?.filter((a : any) => a.directives.indexOf(directive) > -1)
    }

    async getTypes() {
        this.lastUpdate = new Date();
        let result = await this.client.query(
            `   query GetTypes ($directives: [String]){
                    types(hasDirective: $directives)
                }
            `,
            {
                directives: []
            }
        )

        this.types = result.data.types;
        return this.types;
    }

    map(func: any){
        return this.types?.map(func)
    }
}