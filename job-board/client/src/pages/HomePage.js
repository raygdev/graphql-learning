import JobList from '../components/JobList';
import { useJobs } from '../lib/graphql/hooks';

const JOBS_PER_PAGE = 5

function HomePage() {
  const { jobs, loading, error } = useJobs(JOBS_PER_PAGE, 0)
  if(loading) {
    return <div>...Loading</div>
  }

  if(error) {
    return <div className='has-text-danger'>Something went wrong</div>
  }
  return (
    <div>
      <h1 className="title">
        Job Board
      </h1>
      <JobList jobs={jobs} />
    </div>
  );
}

export default HomePage;
