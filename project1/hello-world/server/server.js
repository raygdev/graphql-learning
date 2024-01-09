import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"

const typeDefs = `#graphql
  schema {
    query: Query
  }
  type Query {
    greeting: String
  }
`;

const resolvers = {
    Query: {
        greeting: () => 'Hello World!'
    }
};

const server = new ApolloServer({ typeDefs, resolvers })
const info = await startStandaloneServer(server, { listen: { port: 9000 } })
console.log(`server running at ${info.url}`)
