import { ApolloClient, gql, InMemoryCache, concat, createHttpLink, ApolloLink } from '@apollo/client'
import { getAccessToken } from '../auth'

const httpLink = createHttpLink({
  uri: 'http://localhost:9000/graphql'
})


const authLink = new ApolloLink((operation, forward) => {
  const accessToken = getAccessToken()
  if(accessToken) {
    operation.setContext({
      headers: { "Authorization": `Bearer ${accessToken}`}
    })
  }
  return forward(operation)
})

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: concat(authLink, httpLink)
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
    const result = await apolloClient.query({
      query,
      fetchPolicy: `network-only`
    })
    return result.data.jobs
}

export async function getJob(id) {
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
`

const jobByIdQuery = gql`
    query ($id: ID!){
      job(id: $id) {
       ...JobDetail
      }
    }
    ${jobDetailsFragment}
  `
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