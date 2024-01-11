import { GraphQLClient, gql } from "graphql-request"

const client = new GraphQLClient('http://localhost:9000/graphql')

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
    const data = await client.request(query)
    return data.jobs
}

export async function getJob(id) {
  const query = gql`
    query {
      job(id: "${id}") {
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
  const data = await client.request(query)
  return data.job
}