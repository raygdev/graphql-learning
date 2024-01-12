import { getCompany } from "./db/companies.js"
import { getJob, getJobs, getJobsByCompany } from "./db/jobs.js"

export const resolvers = {
    Query: {
        //resolvers should match the structure of the defined type
        jobs: async () => {
            const jobs = await getJobs()
            return jobs
        },
        //first argument is root, not used here. Second argument is arguments object
        //passes the args from the defined type args.id is what we are looking for in this case
        job: async (_root, args) => await getJob(args.id),
        company: async (_root, args) => await getCompany(args.id)
    },

    Company: {
        jobs: (company) => getJobsByCompany(company.id)
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
        },
        company: async (job) => await getCompany(job.companyId)
    }
}