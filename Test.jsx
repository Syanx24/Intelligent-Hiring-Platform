import { useState } from "react";

function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState("");

  const postJob = () => {
    if (!title.trim()) return;
    setJobs([...jobs, { id: Date.now(), title, status: "Active" }]);
    setTitle("");
  };

  return (
    <div>
      <h2>Recruiter Dashboard</h2>

      <h3>Overview</h3>
      <p>Open Jobs: {jobs.length}</p>

      <h3>Post a Job</h3>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter job title"
      />
      <button onClick={postJob}>Post Job</button>

      <h3>My Jobs</h3>
      {jobs.map((job) => (
        <p key={job.id}>
          {job.title} - {job.status}
        </p>
      ))}
    </div>
  );
}

export default RecruiterDashboard;