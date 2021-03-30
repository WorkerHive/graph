"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const camel_case_1 = require("camel-case");
const utils_1 = require("../utils");
exports.default = (models, client, dispatch) => {
    let actions = {};
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
    models.forEach((model) => {
        console.log(model);
        if (model) {
            const fields = getFields(model);
            actions[`get${model.name}s`] = async () => {
                let result = await client.query(`
                    query Get${model.name}s {
                        ${camel_case_1.camelCase(model.name)}s{
                            ${fields}
                        }
                    }
                `);
                dispatch({ type: `GETS_${model.name}`, data: result.data[`${camel_case_1.camelCase(model.name)}s`] });
                return result.data[`${camel_case_1.camelCase(model.name)}s`];
            };
            actions[`add${model.name}`] = async (filename, cid) => {
                let result = await client.mutation(`
                    mutation Add${model.name}($filename: String, $cid: String){
                        add${model.name}(filename: $filename, cid: $cid){
                            ${fields}
                        }
                    }
                `, {
                    filename,
                    cid
                });
                dispatch({ type: `ADD_${model.name}`, data: result.data[`add${model.name}`] });
                return result.data[`add${model.name}`];
            };
            actions[`delete${model.name}`] = async (id) => {
                let result = await client.mutation(`
                    mutation Delete${model.name}($id: ID){
                        delete${model.name}(id: $id){
                            ${fields}
                        }
                    }
                `, {
                    id: id
                });
                return result.data[`delete${model.name}`];
            };
        }
    });
    return actions;
};
//# sourceMappingURL=upload.js.map