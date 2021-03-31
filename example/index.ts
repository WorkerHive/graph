import HiveGraph from '../packages/graph-server/lib'
import {createReadStream} from 'fs';
import { CRUD, IPFS } from '../packages/graph-plugins/lib';

import { graphqlUploadExpress } from 'graphql-upload'

import {WorkhubFS} from '../packages/graph-ipfs'
import QueenDB from '@workerhive/queendb'

//import  express from 'express';

const bodyParser = require('body-parser')
const express = require('express')
const app = express();


const fs = new WorkhubFS()
const db = new QueenDB({
    host: process.env.QUEENDB_HOST || 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.QUEENDB_PASS || 'password'
});

const graph = new HiveGraph({
    types: `
        type TestType @crud{
            id: ID @uuid
            name: String @input
        }

        type FSNode @upload{
            name: String
            type: String
            cid: String
        }
    `,
    directives: {
        upload: [ IPFS(fs) ],
        crud: [ CRUD(db) ]
    }
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

app.post('/graphql', 
    graphqlUploadExpress({maxFileSize: 10 * 1024 * 1024, maxFiles: 10}), //10x10mb files cap
    (req : any, res : any) => {
        console.log(req.body)
        
        graph.executeRequest(
            req.body.query, 
            req.body.variables, 
            req.body.operationName, {}).then((r) => res.send(r))

    })

app.listen(4002)
    /*
setTimeout(() => {

    const upload = new Upload();
    upload.resolve({
        filename: 'test',
        mimetype: 'application/json',
        encoding: 'utf8',
        createReadStream: createReadStream(__dirname + '/package.json')
    })
graph.executeRequest(`
    mutation M {
        uploadFile{
            name
            cid
        }
    }
`, {
    file: upload
}, 'M', {}).then((data) => {
    console.log(data)
})
}, 1000)

*/