import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"
import { queryType, makeSchema } from "nexus"
//code first approach

/**
 * Advantages of "Code-First"
 *   - Avoid inconsistencies in impl. vs schema
 *   - easier to split into modules
 *   - nexus ensures type safety
 */

//import queryType from nexus
const Query = queryType({
    //definition takes an argument called type (used as "t" conventionally)
    definition: (type) => {
        //define the type... type here is string
       type.string('greeting', {
        //resolve is a function that returns the value of the field "greeting"
        resolve: () => "Hello World!"
       })
    }
})

//import makeSchema from nexus 
//takes an object as an argument and an array of defined query types
const schema = makeSchema({ types: [Query] })
//pass schema to ApolloServer
const server = new ApolloServer({ schema })
const info = await startStandaloneServer(server, { listen: { port: 9000 } })
console.log(`server running at ${info.url}`)