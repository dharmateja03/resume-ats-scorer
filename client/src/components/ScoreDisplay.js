// ScoreDisplay.js
import React from 'react';
import './ScoreDisplay.css';

const ScoreDisplay = ({ score, loading }) => {
  const scoreValue = typeof score === 'number' ? score : score.score;
  
  const getScoreColor = (value) => {
    if (value >= 80) return '#4CAF50'; // Green for high scores
    if (value >= 60) return '#FFC107'; // Yellow for medium scores
    return '#F44336'; // Red for low scores
  };

  const scoreColor = getScoreColor(scoreValue);
  
  const getScoreLabel = (value) => {
    if (value >= 80) return 'Excellent';
    if (value >= 60) return 'Good';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="score-loading">
        <p>Analyzing your resume...</p>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="score-container">
      <div className="score-card">
        <h2 className="card-title">ATS Compatibility Score</h2>
        <div className="score-content">
          <div className="score-circle">
            <span className="score-value">{scoreValue}</span>
          </div>
          <div className="score-label" style={{ color: scoreColor }}>{getScoreLabel(scoreValue)}</div>
          <p className="score-description">This score indicates how well your resume is likely to perform when processed by Applicant Tracking Systems used by employers.</p>
        </div>
      </div>

      {typeof score === 'object' && score.analysis && (
        <div className="score-card">
          <h2 className="card-title">Issues Identified</h2>
          <div className="card-content">
            <p className="issue-item"><strong>Formatting:</strong> {score.analysis.formatting}</p>
            <p className="issue-item"><strong>Keywords:</strong> {score.analysis.keywords}</p>
            <p className="issue-item"><strong>Structure:</strong> {score.analysis.structure}</p>
            <p className="issue-item"><strong>Contact Info:</strong> {score.analysis.contact_info}</p>
            <p className="issue-item"><strong>Content Quality:</strong> {score.analysis.content_quality}</p>
          </div>
        </div>
      )}
      
      {typeof score === 'object' && score.improvement_areas && score.improvement_areas.length > 0 && (
        <div className="score-card">
          <h2 className="card-title">Recommendations</h2>
          <div className="card-content">
            <ul className="recommendations-list">
              {score.improvement_areas.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreDisplay;