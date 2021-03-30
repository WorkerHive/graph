"use strict";
exports.__esModule = true;
var camel_case_1 = require("camel-case");
var utils_1 = require("../utils");
exports["default"] = (function (models, client, dispatch) {
    var actions = {};
    //Takes a type model and iterates over available keys, if key isn't native getFields will be called again to fill out the query fields
    var getFields = function (type, parent) {
        return type.def.map(function (x) {
            var raw = utils_1.rawType(x.type);
            if (utils_1.isNativeType(raw)) {
                return x.name;
            }
            else {
                var model = models.filter(function (a) { return a.name == raw; })[0];
                //Recursion blocker, hopefully stops some of the circular references
                if (!parent || parent.name != raw) {
                    return "\n                        " + x.name + " {\n                            " + getFields(model, type) + "\n                        }\n                    ";
                }
            }
        }).join("\n");
    };
    var setupAdd = function (model, fields) {
        actions["add" + model.name] = function (item) {
            var newObject = utils_1.cleanObject(item, model.def);
            return client.mutation("\n                    mutation Add" + model.name + "($input: " + model.name + "Input){\n                        add" + model.name + "(" + camel_case_1.camelCase(model.name) + ": $input){\n                            " + fields + "\n                        }\n                    }\n                ", {
                input: newObject
            }).then(function (r) { return r.data["add" + model.name]; }).then(function (data) {
                dispatch({ type: "ADD_" + model.name, data: data });
                return data;
            });
        };
    };
    var setupDelete = function (model, fields) {
        actions["delete" + model.name] = function (id) {
            return client.mutation("\n            mutation Delete" + model.name + "($id: ID){\n                delete" + model.name + "(id: $id)\n            }\n        ", {
                id: id
            }).then(function (r) { return r.data["delete" + model.name]; }).then(function (data) {
                if (data)
                    dispatch({ type: "DELETE_" + model.name, id: id });
                return data;
            });
        };
    };
    var setupUpdate = function (model, fields) {
        actions["update" + model.name] = function (id, update) {
            var updateObject = utils_1.cleanObject(update, model.def);
            delete updateObject.id;
            return client.mutation("\n            mutation Update" + model.name + "($id: ID, $update: " + model.name + "Input){\n                update" + model.name + "(" + camel_case_1.camelCase(model.name) + ": $update, id: $id){\n                    " + fields + "\n                }\n            }\n            ", {
                id: id,
                update: updateObject
            }).then(function (r) { return r.data["update" + model.name]; }).then(function (data) {
                dispatch({ type: "UPDATE_" + model.name, id: id, data: data });
                return data;
            });
        };
    };
    var setupRead = function (model, fields) {
        actions["get" + model.name] = function (id, cache) {
            if (cache === void 0) { cache = true; }
            return client.query("\n            query Get" + model.name + "($id: ID){\n                " + camel_case_1.camelCase(model.name) + "(id: $id) {\n                    " + fields + "\n                }\n            }\n        ", {
                id: id
            }).then(function (r) { return r.data["" + camel_case_1.camelCase(model.name)]; }).then(function (data) {
                dispatch({ type: "GET_" + model.name, id: id, data: data });
                return data;
            });
        };
    };
    var setupReadAll = function (model, fields) {
        actions["get" + model.name + "s"] = function (cache) {
            if (cache === void 0) { cache = true; }
            return client.query("\n                query Get" + model.name + "s {\n                    " + camel_case_1.camelCase(model.name) + "s {\n                        " + fields + "\n                    }\n                }\n                ").then(function (r) { return r.data[camel_case_1.camelCase(model.name) + "s"]; }).then(function (data) {
                dispatch({ type: "GETS_" + model.name, data: data });
                return data;
            });
        };
    };
    console.log(models);
    models.forEach(function (model) {
        console.log("Setting up actions for model");
        var fields = getFields(model);
        setupAdd(model, fields);
        setupDelete(model, fields);
        setupUpdate(model, fields);
        setupReadAll(model, fields);
        setupRead(model, fields);
    });
    return actions;
});
