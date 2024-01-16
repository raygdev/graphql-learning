import JobList from '../components/JobList';
import { useJobs } from '../lib/graphql/hooks';

function HomePage() {
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
