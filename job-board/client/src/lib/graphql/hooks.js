import { useQuery } from "@apollo/client"
import { companyByIdQuery, jobByIdQuery, getJobsQuery } from "./queries"

export function useCompany(id) {
    const { data, loading, error } = useQuery(companyByIdQuery, {
      variables: { id }
    })
    return { company: data?.company, loading, error: Boolean(error)}
  }

  export function useJob(id) {
    const { data, loading, error } = useQuery(jobByIdQuery, {
        variables: { id }
    })
    return { job: data?.job, loading, error: Boolean(error)}
  }