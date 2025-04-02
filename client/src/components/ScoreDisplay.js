import React from 'react';
import './ScoreDisplay.css';

const ScoreDisplay = ({ score }) => {
  
  const scoreValue = typeof score === 'number' ? score : score.score;
  
 
  const getScoreColor = (value) => {
    if (value >= 80) return '#4CAF50'; // Green for high scores
    if (value >= 60) return '#FFC107'; // Yellow for medium scores
    return '#F44336'; // Red for low scores
  };

  const scoreColor = getScoreColor(scoreValue);
  
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (scoreValue / 100) * circumference;

  const getDefaultRecommendations = (value) => {
    if (value >= 80) {
      return [
        "Great job! Your resume is well-optimized for ATS systems.",
        "Consider tailoring specific keywords for each job application."
      ];
    } else if (value >= 60) {
      return [
        "Your resume is likely to pass ATS screening but could use improvements.",
        "Add more industry-specific keywords relevant to your target positions.",
        "Ensure your skills section clearly lists technical competencies."
      ];
    } else {
      return [
        "Your resume may struggle to pass ATS screening systems.",
        "Avoid using tables, headers/footers, and complex formatting.",
        "Include more relevant keywords from the job descriptions.",
        "Use standard section headings (Experience, Education, Skills)."
      ];
    }
  };

  const recommendations = typeof score === 'object' && score.improvement_areas 
    ? score.improvement_areas 
    : getDefaultRecommendations(scoreValue);

  return (
    <div className="score-display">
      <div className="score-circle-container">
        <svg width="120" height="120" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle 
            cx="60" 
            cy="60" 
            r={radius} 
            fill="transparent" 
            stroke="#e0e0e0" 
            strokeWidth="8"
          />
          
          {/* Score circle */}
          <circle 
            cx="60" 
            cy="60" 
            r={radius} 
            fill="transparent" 
            stroke={scoreColor} 
            strokeWidth="8" 
            strokeLinecap="round" 
            strokeDasharray={circumference} 
            strokeDashoffset={dashOffset}
            transform="rotate(-90 60 60)"
            className="score-circle"
          />
          
          {/* Score text */}
          <text 
            x="60" 
            y="60" 
            fontFamily="Arial" 
            fontSize="24" 
            fontWeight="bold"
            fill={scoreColor} 
            textAnchor="middle" 
            dominantBaseline="middle"
          >
            {scoreValue}
          </text>
          
          {/* Percentage symbol */}
          <text 
            x="78" 
            y="45" 
            fontFamily="Arial" 
            fontSize="12" 
            fill={scoreColor} 
            textAnchor="middle" 
            dominantBaseline="middle"
          >
            %
          </text>
        </svg>
      </div>
      
      <div className="score-details">
        <h2>ATS Compatibility Score</h2>
        <div className="score-status" style={{ color: scoreColor }}>
          {scoreValue >= 80 ? 'Excellent' : scoreValue >= 60 ? 'Good' : 'Needs Improvement'}
        </div>
        
        {typeof score === 'object' && score.analysis && (
          <div className="analysis-details">
            <h3>Detailed Analysis:</h3>
            <ul>
              <li><strong>Formatting:</strong> {score.analysis.formatting}</li>
              <li><strong>Keywords:</strong> {score.analysis.keywords}</li>
              <li><strong>Structure:</strong> {score.analysis.structure}</li>
              <li><strong>Contact Info:</strong> {score.analysis.contact_info}</li>
              <li><strong>Content Quality:</strong> {score.analysis.content_quality}</li>
            </ul>
          </div>
        )}
        
        <div className="recommendations">
          <h3>Recommendations:</h3>
          <ul>
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScoreDisplay;