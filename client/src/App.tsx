import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

type Job = {
  id: string;
  name: string;
  data: any;
  nextRunAt: string | null;
  lastRunAt: string | null;
  failedAt: string | null;
  priority: number;
  disabled: boolean;
  repeating?: {
    interval?: string;
    timezone?: string;
  };
};

type Stats = {
  total: number;
  scheduled: number;
  completed: number;
  failed: number;
  queued: number;
  successRate: string;
};

function App() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const statsRes = await axios.get('http://localhost:3000/api/stats');
      setStats(statsRes.data);

      const jobsRes = await axios.get('http://localhost:3000/api/jobs');
      setJobs(jobsRes.data.data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Agendash Dashboard</h1>
      {loading && <div className="loader">Loading...</div>}
      {!loading && stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h2>Total Jobs</h2>
            <p>{stats.total}</p>
          </div>
          <div className="stat-card">
            <h2>Scheduled</h2>
            <p>{stats.scheduled}</p>
          </div>
          <div className="stat-card">
            <h2>Completed</h2>
            <p>{stats.completed}</p>
          </div>
          <div className="stat-card">
            <h2>Failed</h2>
            <p>{stats.failed}</p>
          </div>
          <div className="stat-card">
            <h2>Queued</h2>
            <p>{stats.queued}</p>
          </div>
          <div className="stat-card">
            <h2>Success Rate</h2>
            <p>{stats.successRate}%</p>
          </div>
        </div>
      )}

      {!loading && (
        <div className="jobs-table-container">
          <h2>Jobs</h2>
          <table className="jobs-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Next Run</th>
                <th>Last Run</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Disabled</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td>{job.name}</td>
                  <td>{job.nextRunAt ? new Date(job.nextRunAt).toLocaleString() : '-'}</td>
                  <td>{job.lastRunAt ? new Date(job.lastRunAt).toLocaleString() : '-'}</td>
                  <td>
                    {job.failedAt
                      ? <span className="status failed">Failed</span>
                      : job.nextRunAt
                        ? <span className="status scheduled">Scheduled</span>
                        : <span className="status completed">Completed</span>
                    }
                  </td>
                  <td>{job.priority}</td>
                  <td>{job.disabled ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer>
        <p style={{ marginTop: 32, color: '#888' }}>
          Powered by <b>Agendash Custom</b>
        </p>
      </footer>
    </div>
  );
}

export default App;