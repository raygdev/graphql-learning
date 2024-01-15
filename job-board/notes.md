## Initializing GraphQLClient from graphql-request
```js
const client = new GraphQLClient('http://localhost:9000/graphql', {
  //example of auth headers for authentication with apollo server
  //function returns either a auth header or an empty object
  headers: () => {
    const accessToken = getAccessToken()
    if(accessToken) {
      return {
        "Authorization": `Bearer ${accessToken}`
      }
    }
    return {}
  }
})
```

The first argument to the new instance is a url for the requests...
an example request:

```js
async function getJob(id) {
  //gql is a special function for syntax highliting
  //in js from graphql-request package
  //$id denotes a variable (passed to variables object)
  //ID indicates a scalar type from gql
  // the '!' at the end says the id should be non-null
  //passing the (id) param may allow for unescaped characters
  const query = gql`
    query getJob($id: ID!) {
      job(id: $id) {
          id
          description
          title
          company {
              name
              id
          }
      }
    }
  `
  //takes an arugment query or mutation
  //second argument is a variables object
  //request is async so it must be awaited
  const data = await client.request(query, { id })
  return data.job
}
```

## Mutations

Creating a mutation is similar. When you create a mutation you are also going
to pass any variables to the request as the second argument.

```js
//assumes a mutation for creating a job
const data = await client.request(mutation, { companyId, title, description })
```

Mutatuion variables can be optional or non-nullable. To make them non-nullable
is the same as any other variable. Just add a `!` at the end.

Defining a mutation on the server would look something like this
```gql
# mutations are a main type like "Query"
type Mutation {
  createJob(input: CreateJobInput!): JOB!
}
```

`input` is a keyword in GraphQL like `type`. It will define the 
type or shape of expected input for the mutation. `CreateJobInput`
is non-nullable. If the proper fields are not passed, GraphQL will
throw an error.

```gql
input CreateJobInput {
  title: String!
  description: String
}
```

The `title` field is defined as a `String` type that is non-nullable
while the `description` field is optional (can be null). This value 
would then be passed to the resolver object.

```js
export const resolvers = {
  Query: {/*...*/}
  Mutation: {
    createJob: (_root, { input: { title, description }}, { user }) => {
      if(!user) {
        throw unauthorizedError("Missing Authentication")
      }
      const companyId = user.companyId
      return createJob({ title, description, companyId })
    }
  }
}
```
`Root` is the source and passed as the first argument. The second 
argument is the `arguments` object passed to the funciton. The `input`
is an argument property that passes the object value of the fields to
be mutated (`title` and `description`). The third argument is the `context` object which may be undefined
or have a value. Here `user` is passed for auth context and to provide a company
id that the created job belongs to.

## Configuring ApolloClient

Links can be made for a GraphQL `operation`. You can create 
intermediate links that can forward other operations. 
The last link in  the chain is considered the terminating link.
Each `operation` should be passed to the `forward` function unless
it is the last (`terminating`) link in the chain. Refer to 
[Apollo Link Overview](https://www.apollographql.com/docs/react/api/link/introduction/)

```js
const httpLink = createHttpLink({
  uri: 'http://localhost:9000/graphql'
})
```
An auth link example to pass headers with an authorization header
on each request. If the token is found we add the auth header for 
the request. If there is no token, we just forward the operation.

```js
const authLink = new ApolloLink((operation, forward) => {
  const accessToken = getAccessToken()
  if(accessToken) {
    operation.setContext({
      headers: { "Authorization": `Bearer ${accessToken}`}
    })
  }
  return forward(operation)
})
```

We then pass the `authLink` and the `httpLink` to the link property
of the configuration object for `ApolloClient`.

```js
const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: concat(authLink, httpLink),
  // uri: 'http:localhost:9000/gql-endpoint',
  // defaultOptions,
  /*other options*/
})
```

The `concat` method from the `@apollo/client` package will
concatenate the links together. Order is important, just like
middleware they are called in order. `forward` would be undefined
otherwise and cause errors.

The default options object that can be set in the config has,
among other properties, ways you can determine what is fetched
over network and what is fetch from the cache. You can configure
all requests or a per-request basis during the fetch.

```js
  //default options to set differenct config
  //for things like query on all query requests.
const defaultOptions = {
    query: {
      fetchPolicy: 'network-only'
    },
    watchQuery: {
      fetchPolicy: 'network-only'
    }
  }
```

An example request using `apolloClient` with a per
request fetch for `network-only` which will make a
network request instead of from the cache.

```js
export async function getJobs() {
    const query = gql`
      query {
        jobs {
          id
          date
          title
          company {
            id
            name
          }
        }
      }
    `
    const result = await apolloClient.query({
      query,
      //fetch policy is for how you want client to request
      //...here 'network-only' means fetch fresh data for every request
      //default is 'cached-first'
      fetchPolicy: `network-only`
    })
    return result.data.jobs
}
```

An example of a mutation that both makes a single network request and writes to the
cache. This will save an extra network request where normally two would be made.

```js
export async function createJob({ title, description }) {
  //job: createJob is syntax for an alias... the mutation returns a job
  const mutation = gql`
    mutation CreateJob($input: CreateJobInput!) {
      job: createJob(input: $input) {
        ...JobDetail
      }
    }
    ${jobDetailsFragment}
  `
  const result = await apolloClient.mutate({
    mutation,
    variables: { input: { title, description }},
    //update is a third property to update
    //when mutation is performed
    //takes in two arguments, cache and result
    update: (cache, { data }) => {
      cache.writeQuery({
        query: jobByIdQuery,
        variables: { id: data.job.id},
        data
      })
    }
  })
  return result.data.job
}
```

The `update` method takes in two arguments the `cache` object and the `result`
object. The `result` carries the data from the mutation that occured. 
`cache.writeQuery` takes an object as an argument. This object will contain 
the `qeury` and `variables` object. Since the cache makes a `__ref` to the obejct
it follows the pattern of `<__typename>:<id>`. In this case `__typename` is `Job`
the id is a random string `xyz`. The `__ref` will have the value `Job:xyz`. The
third property is the data to be written to the cache. This will be looked up when
the user is navigated to the appropriate job listing after creation.

This all comes from the `cache` property of the configuration object passed to
`ApolloClient`. The function is shipped from the `@apollo/client` package as
`InMemoryCache`. `InMemoryCache` can also take a configuration as well.

## Fragments

You can create a fragment on a field. This is a reusable peice of 
code that will allow you to query similar fields where needed.

```js
const JobDetailsFragment = gql`
  fragment JobDetail on Job {
    id
    title
    description
    date
    company {
      id
      name
    }
  }
`
```

You then pass the fragment name `JobDetail` to the query you need to
use the fields in.

```js
const JobByIdQuery = gql`
  query ($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  ${jobDetailsFragment}
`
```

The variable `jobDetailsFragment` is passed to the template
literal after the query object and before the closing template
literal backtick.