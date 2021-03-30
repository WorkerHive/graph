"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const camel_case_1 = require("camel-case");
const utils_1 = require("../utils");
exports.default = (models, client, dispatch) => {
    let actions = {};
    //Takes a type model and iterates over available keys, if key isn't native getFields will be called again to fill out the query fields
    const getFields = (type, parent) => {
        return type.def.map((x) => {
            let raw = utils_1.rawType(x.type);
            if (utils_1.isNativeType(raw)) {
                return x.name;
            }
            else {
                let model = models.filter((a) => a.name == raw)[0];
                //Recursion blocker, hopefully stops some of the circular references
                if (!parent || parent.name != raw) {
                    return `
                        ${x.name} {
                            ${getFields(model, type)}
                        }
                    `;
                }
            }
        }).join(`\n`);
    };
    const setupAdd = (model, fields) => {
        actions[`add${model.name}`] = (item) => {
            const newObject = utils_1.cleanObject(item, model.def);
            return client.mutation(`
                    mutation Add${model.name}($input: ${model.name}Input){
                        add${model.name}(${camel_case_1.camelCase(model.name)}: $input){
                            ${fields}
                        }
                    }
                `, {
                input: newObject
            }).then((r) => r.data[`add${model.name}`]).then((data) => {
                dispatch({ type: `ADD_${model.name}`, data: data });
                return data;
            });
        };
    };
    const setupDelete = (model, fields) => {
        actions[`delete${model.name}`] = (id) => {
            return client.mutation(`
            mutation Delete${model.name}($id: ID){
                delete${model.name}(id: $id)
            }
        `, {
                id: id
            }).then((r) => r.data[`delete${model.name}`]).then((data) => {
                if (data)
                    dispatch({ type: `DELETE_${model.name}`, id: id });
                return data;
            });
        };
    };
    const setupUpdate = (model, fields) => {
        actions[`update${model.name}`] = (id, update) => {
            const updateObject = utils_1.cleanObject(update, model.def);
            delete updateObject.id;
            return client.mutation(`
            mutation Update${model.name}($id: ID, $update: ${model.name}Input){
                update${model.name}(${camel_case_1.camelCase(model.name)}: $update, id: $id){
                    ${fields}
                }
            }
            `, {
                id,
                update: updateObject
            }).then((r) => r.data[`update${model.name}`]).then((data) => {
                dispatch({ type: `UPDATE_${model.name}`, id: id, data: data });
                return data;
            });
        };
    };
    const setupRead = (model, fields) => {
        actions[`get${model.name}`] = (id, cache = true) => {
            return client.query(`
            query Get${model.name}($id: ID){
                ${camel_case_1.camelCase(model.name)}(id: $id) {
                    ${fields}
                }
            }
        `, {
                id: id
            }).then((r) => r.data[`${camel_case_1.camelCase(model.name)}`]).then((data) => {
                dispatch({ type: `GET_${model.name}`, id: id, data: data });
                return data;
            });
        };
    };
    const setupReadAll = (model, fields) => {
        actions[`get${model.name}s`] = (cache = true) => {
            return client.query(`
                query Get${model.name}s {
                    ${camel_case_1.camelCase(model.name)}s {
                        ${fields}
                    }
                }
                `).then((r) => r.data[`${camel_case_1.camelCase(model.name)}s`]).then((data) => {
                dispatch({ type: `GETS_${model.name}`, data: data });
                return data;
            });
        };
    };
    console.log(models);
    models.forEach((model) => {
        console.log("Setting up actions for model");
        const fields = getFields(model);
        setupAdd(model, fields);
        setupDelete(model, fields);
        setupUpdate(model, fields);
        setupReadAll(model, fields);
        setupRead(model, fields);
    });
    return actions;
};
//# sourceMappingURL=crud.js.map