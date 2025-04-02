import React, { useState, useEffect } from 'react';
import '../StatsDashboard.css';
const StatsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data.stats);
      } catch (err) {
        setError('Failed to load statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="stats-loading">
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="stats-dashboard">
      <header className="stats-header">
        <h1>Resume ATS Scorer - Usage Statistics</h1>
      </header>
      
      <div className="stats-grid">
        <div className="stats-card total-users">
          <h2>Total Users</h2>
          <div className="stats-number">{stats?.totalUsers || 0}</div>
        </div>
        
        <div className="stats-card today-users">
          <h2>Today's Users</h2>
          <div className="stats-number">{stats?.todayUsers || 0}</div>
        </div>
        
        <div className="stats-card average-score">
          <h2>Average Score</h2>
          <div className="stats-number">{stats?.averageScore || 0}<span className="percent">%</span></div>
        </div>
      </div>
      
      <div className="recent-uploads">
        <h2>Recent Uploads</h2>
        {stats?.recentUploads?.length > 0 ? (
          <table className="uploads-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Score</th>
                <th>File Type</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUploads.map((upload, index) => (
                <tr key={index}>
                  <td>{new Date(upload.timestamp).toLocaleString()}</td>
                  <td className={
                    upload.score >= 80 ? 'score-high' : 
                    upload.score >= 60 ? 'score-medium' : 
                    'score-low'
                  }>
                    {upload.score}%
                  </td>
                  <td>{upload.fileType.split('/')[1].toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-uploads">No recent uploads</p>
        )}
      </div>
    </div>
  );
};

export default StatsDashboard;