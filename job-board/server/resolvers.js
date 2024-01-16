import { GraphQLError } from "graphql"
import { getCompany } from "./db/companies.js"
import { getJob, getJobs, getJobsByCompany, createJob, deleteJob, updateJob } from "./db/jobs.js"

export const resolvers = {
    Query: {
        //resolvers should match the structure of the defined type
        jobs: async (_root, { limit, offset }) => {
            const items = await getJobs(limit, offset)
            return  {
                items,
                totalCount: 0
            }
        },
        //first argument is root, not used here. Second argument is arguments object
        //passes the args from the defined type args.id is what we are looking for in this case
        job: async (_root, args) => {
            const job = await getJob(args.id)
            if(!job) {
                throw new GraphQLError("Could not find job with id " + args.id, {
                    extensions: { code: "NOT_FOUND"}
                })
            }
            return job
        },
        company: async (_root, args) => {
            const company = await getCompany(args.id)
            if(!company) {
              throw new GraphQLError('No Company found with id ' + args.id, {
                extensions: { code: "NOT_FOUND"}
              })
            }
            return company
        }
    },

    Mutation: {
        //first argument is the root or source, second argument is args,
        //and third argument is context
        createJob: (_root, { input: { title, description } }, { user }) => {
            if(!user) {
                throw unauthorizedErorr("Missing Authentication")
            }
            const companyId = user.companyId
            return createJob({ title, description, companyId })
        },
        deleteJob: async (_root, { id }, { user }) => {
              if(!user) {
                throw unauthorizedErorr("Missing Authentication")
              }
              const deletedJob = await deleteJob(id, user.companyId)
              if(!deletedJob) {
                throw notFoundError(`Could not find job with id ${id}`)
              }
              return deletedJob
        },

        updateJob: async (_root, { input }, { user }) => {
            if(!user) {
              throw unauthorizedErorr("Missing Authentication")
            }
            const updatedJob = await updateJob(input, user.companyId)
            if(!updatedJob) {
              throw notFoundError(`Could not find job with id ${input.id}`)
            }
            return updatedJob
        }
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
        company: async (job, _args, { companyLoader }) => await companyLoader.load(job.companyId)
    }
}

function unauthorizedErorr(message) {
    return new GraphQLError(message, {
        extensions: { code: "UNAUTHORIZED" }
    })
}

function notFoundError(message) {
    return new GraphQLError(message, {
        extensions: { code: "NOT_FOUND" }
    })
}