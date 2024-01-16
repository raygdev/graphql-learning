import { ApolloServer } from "@apollo/server"
import { expressMiddleware as apolloMiddleware } from "@apollo/server/express4"
import cors from 'cors';
import express from 'express';
import { readFile } from "node:fs/promises"
import { authMiddleware, handleLogin } from './auth.js';
import { resolvers } from "./resolvers.js"
import { getUser } from "./db/users.js";
import { createCompanyLoader } from "./db/companies.js";

const PORT = 9000;

const app = express();
app.use(cors(), express.json(), authMiddleware);

app.post('/login', handleLogin);

const typeDefs = await readFile('./schema.graphql', 'utf8')

async function getContext({ req }) {
  const companyLoader = createCompanyLoader()
  const context = { companyLoader }
  if(req.auth) {
    context.user = await getUser(req.auth.sub)
    
  }
  //getContext passed to context property for options to apolloMiddleware
  //accepts req and res from express.
  //the auth property comes from express-jwt package and passes the decoded
  //value of the token down the middleware chain
  // return { auth: req.auth }
  return context
}

const apolloServer = new ApolloServer({ typeDefs, resolvers })
await apolloServer.start()
//pass getContext to the options object
app.use("/graphql", apolloMiddleware(apolloServer, { context: getContext}))


app.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`)
});
