'use strict';

import HiveGraph from '../lib'

let server = new HiveGraph(`
    type TestType @crud{
        id: ID
        name: String @input
    }

    type SecondTest @crud{
        id: String @uuid
        name: String @input
    }

    type User @crud{
        id: ID
        name: String @input
        pwd: Hash @input
        slug: String @moniker
    }
`, {
    Query: {
        testTypes: (parent : any, args : any, context : any) => {
            return [{id: 1, name: "Test"}]
        }
    },
    Mutation: {
        addUser: (parent: any, args: any, context: any) => {
            return args.user;
        }
    }
})

describe('graph-server', () => {
    test('has-types', () => {
        let first = server.typeRegistry.getType('TestType')
        let second = server.typeRegistry.getType('SecondTest')

        expect(first.name).toBe('TestType')
        expect(second.name).toBe('SecondTest')

        expect(first.directives.indexOf('crud') > -1).toBe(true)
        expect(second.directives.indexOf('crud') > -1).toBe(true)
    })

    test('scalars', async () => {
        let result = await server.executeRequest(`
            mutation M ($testType: UserInput){
                addUser(user: $testType){
                    id
                    name
                    pwd
                    slug
                }
            }
        `, {testType: {name: "User", pwd: "Pwd"}}, 'M', {})
        
        console.log(result)

        expect(result?.data?.addUser.pwd).toBe('2c125a0d09e71431021336e9587b78a7a1bab94da26333e97a3e6da1f2b03ca5')
    })

    test('executable', async () => {
        let result = await server.executeRequest(`
            query Q{
                testTypes{
                    id
                    name
                }
            }
        `, {}, 'Q', {})

        expect(result?.data?.testTypes).toEqual([{id: "1", name: "Test"}])
    })
});
