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

export const apolloClient = new ApolloClient({
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

const jobDetailsFragment = gql`
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
export const companyByIdQuery = gql`
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
export const getJobsQuery = gql`
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

export const jobByIdQuery = gql`
    query ($id: ID!){
      job(id: $id) {
       ...JobDetail
      }
    }
    ${jobDetailsFragment}
  `

export const createJobMutation = gql`
    mutation CreateJob($input: CreateJobInput!) {
      job: createJob(input: $input) {
        ...JobDetail
      }
    }
    ${jobDetailsFragment}
  `
  
export async function getJob(id) {
  const result = await apolloClient.query({
    query: jobByIdQuery,
    variables: { id },
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