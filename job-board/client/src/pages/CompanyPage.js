import { useParams } from 'react-router';
import { companyByIdQuery } from '../lib/graphql/queries';
import JobList from '../components/JobList';
import { useQuery } from '@apollo/client';

function useCompany(id) {
  const { data, loading, error } = useQuery(companyByIdQuery, {
    variables: { id }
  })
  return { company: data?.company, loading, error: Boolean(error)}
}

function CompanyPage() {
  const { companyId } = useParams();
  const { company, loading, error }  = useCompany(companyId)

  if(loading) {
    return <div>Loading...</div>
  }

  if(error) {
    return <div className='has-text-danger'>Data unavailable</div>
  }

  return (
    <div>
      <h1 className="title">
        {company.name}
      </h1>
      <div className="box">
        {company.description}
      </div>
      <h2 className='title is-5'>
        Jobs at {company.name}
      </h2>
      <JobList jobs={company.jobs} />
    </div>
  );
}

export default CompanyPage;
