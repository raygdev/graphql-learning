import { getJobs } from "./db/jobs.js"

export const resolvers = {
    Query: {
        //resolvers should match the structure of the defined type
        jobs: async () => {
            const jobs = await getJobs()
            return jobs
        }
    },
    Job: {
        /**
         * resolver functions take multiple arguments
         * date gets called for each job. each job
         * is passed as an argument to the resolver
         * this changes createdAt field in db to a date
         * field for graphql
        */
        date: (job) => {
            return job.createdAt.slice(0, 'yyyy-mm-dd'.length)
        }
    }
}