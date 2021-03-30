import { GraphQLBoolean, GraphQLFloat, GraphQLString } from "graphql";
import { GraphQLID } from "graphql";
import { ObjectTypeComposer, SchemaComposer } from "graphql-compose";
import { Type } from "../registry/type";

export function objectValues<T>(obj: { [name: string]: T }): T[] {
    return Object.keys(obj).map(i => obj[i]);
}

export function getTypesWithDirective(composer: SchemaComposer<any>, name: string): Array<Type> {
    let types: Array<Type> = [];
    composer.types.forEach((val, key) => {
        if (typeof (key) === 'string' && val instanceof ObjectTypeComposer) {
            if (!name || name.length < 1) {
                types.push(new Type(composer.getOTC(key)))
            } else if (val.getDirectives().map((x) => x.name).indexOf(name) > -1) {
                types.push(new Type(composer.getOTC(key)))
            }
        }
    })
    return types;
}

export function getTypesWithFieldDirective(composer: SchemaComposer<any>, name: string): Array<Type> {
    let types: Array<Type> = [];
    composer.types.forEach((val, key) => {
        if (typeof (key) == 'string' && composer.isObjectType(key)) {
            let fields = composer.getOTC(key).getFields();
            for (var fieldKey in fields) {
                if (composer.getOTC(key).getFieldDirectiveNames(fieldKey).indexOf(name) > -1) {
                    types.push(new Type(composer.getOTC(key)))
                    break;
                }
            }
            //            val.
        }
    })
    return types;
}

import Scalars from '../scalars';

export const isNativeType = (type : string) => {
    switch (type) {
        case "Hash":
            return "Hash";
        case "JSON":
            return "JSON"
        case "Date":
            return "Date";
        case "ID":
            return "ID";
        case "String":
            return "String";
        case "Int":
            return "Int"
        case "Float":
            return "Float";
        case "Upload":
            return "Upload";
        case "Boolean":
            return "Boolean";
        default:
            console.log(Scalars.map((x) => x.name), type)
            if(Scalars.map((x) => x.name).indexOf(type) > -1){
                return type;
            }else{
                return null;
            }
    }
}

export const convertInput = (type: string, args: { ref: boolean } = { ref: false }) => {
    let squareBracketRegex = /\[(.*?)\]/

    let outputFields = {};

    let newType;

    let bracketMatch = type.match(squareBracketRegex)
    if (!bracketMatch) {
        if (isNativeType(type) != null) {
            newType = type
        } else {
            if (args.ref) {
                newType = 'JSON'
            } else {
                newType = `${type}Input`
            }
        }

    } else{
        let arrType = bracketMatch[1];

        if (isNativeType(arrType) != null) {
            newType = `[${arrType}]`;
        } else {
            if (args.ref) {
                newType = 'JSON'
            } else {
                newType = `[${arrType}Input]`
            }
        }


    }
    return newType;

}