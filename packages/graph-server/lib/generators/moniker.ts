import { GraphGenerator } from "."
const Moniker = require('moniker')

export const monikerMiddleware : GraphGenerator = {
    directiveName: 'moniker',
    actions: {
        create: (type, field) => {
            if(field) return field;
            return Moniker.choose();
        }, 
       
    }
}