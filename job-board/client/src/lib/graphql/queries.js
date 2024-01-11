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
  const data = await client.request(query, { id })
  return data.job
}