import { ApolloClient, gql, InMemoryCache } from '@apollo/client'
import { GraphQLClient } from "graphql-request"
import { getAccessToken } from '../auth'

const client = new GraphQLClient('http://localhost:9000/graphql', {
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

const apolloClient = new ApolloClient({
  uri: 'http://localhost:9000/graphql',
  cache: new InMemoryCache()
})

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
    // const data = await client.request(query)
    // return data.jobs
    const result = await apolloClient.query({ query })
    return result.data.jobs
}

export async function getJob(id) {
    //passing directly as a string might let unescaped characters in.
    //query ($id: ID!) means that $id is the variable and it is a non-nullable
    //id that is expected
    //then passed to job(id: $id) as the id (variable) to be used.
  const query = gql`
    query ($id: ID!){
      job(id: $id) {
        id
        title
        description
        date
        company {
          id
          name
        }
      }
    }
  `
  //id is passed in an object for the query
  //second argument is variables object. 
  // const data = await client.request(query, { id })
  // return data.job
  const result = await apolloClient.query({
    query,
    variables: { id }
  })
  return result.data.job
}

export async function getCompany(id) {
  const query = gql`
    query($id: ID!) {
      company(id: $id) {
        id
        name
        description
        jobs {
          id
          date
          title
        }
      }
    }
  `

  // const data = await client.request(query, { id })
  // return data.company
  const result = await apolloClient.query({
    query,
    variables: { id }
  })
  return result.data.company
}

export async function createJob({ title, description }) {
  //job: createJob is syntax for an alias... the mutation returns a job
  const mutation = gql`
    mutation CreateJob($input: CreateJobInput!) {
      job: createJob(input: $input) {
        id
      }
    }
  `
  // const data = await client.request(mutation, {
  //   input: { title, description } 
  // })
  // return data.job
  const result = await apolloClient.mutate({
    mutation,
    variables: { input: { title, description }}
  })
  return result.data.job
}