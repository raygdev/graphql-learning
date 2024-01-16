import { useState } from 'react';
import { useNavigate } from 'react-router'
import { useCreateJob } from '../lib/graphql/hooks';

function CreateJobPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { handleMutation, loading, error } = useCreateJob()

  const handleSubmit = async (event) => {
    event.preventDefault();
    const job = await handleMutation(title, description)
    console.log(job)
    navigate(`/jobs/${job.id}`)
  };

  if(error) {
    return <div className='has-text-danger'>Something went wrong</div>
  }

  return (
    <div>
      <h1 className="title">
        New Job
      </h1>
      <div className="box">
        <form>
          <div className="field">
            <label className="label">
              Title
            </label>
            <div className="control">
              <input className="input" type="text" value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label className="label">
              Description
            </label>
            <div className="control">
              <textarea className="textarea" rows={10} value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <div className="control">
              <button className="button is-link" disabled={loading}
                      onClick={handleSubmit}>
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateJobPage;
