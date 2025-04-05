import React, { useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from './ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import './JobMatchPage.css';

const JobMatchPage = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf' || 
          file.type === 'application/msword' ||
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setResumeFile(file);
        setError('');
      } else {
        setError('Please upload a PDF or Word document (.pdf, .doc, .docx)');
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type === 'application/pdf' || 
          file.type === 'application/msword' ||
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setResumeFile(file);
        setError('');
      } else {
        setError('Please upload a PDF or Word document (.pdf, .doc, .docx)');
      }
    }
  };

  const analyzeMatch = async () => {
    if (!resumeFile) {
      setError('Please upload your resume first');
      return;
    }
    
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobDescription', jobDescription);
      
      const response = await fetch('http://localhost:3001/api/job-match', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze job match');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Error analyzing job match:', err);
      setError('Failed to analyze job match. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeFile = () => {
    setResumeFile(null);
  };

  return (
    <div className="job-match-page">
      <header className="page-header">
        <div className="header-left">
          <h1 className="logo-text">ResumeATS</h1>
        </div>
        <div className="header-right">
          <nav className="main-nav">
            <Link to="/">Home</Link>
            <Link to="/score">Score</Link>
            <Link to="/stats">Stats</Link>
          </nav>
          <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        </div>
      </header>

      <main>
        <div className="page-intro">
          <h1>Job Match Analysis</h1>
          <p>Compare your resume against a job description to see how well you match.</p>
        </div>
        
        <div className="input-container">
          <div className="input-column">
            <div className="input-field">
              <label>Upload Resume</label>
              <div 
                className={`file-drop-area ${resumeFile ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  className="file-input" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                />
                
                {!resumeFile ? (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p> <button onClick={handleBrowseClick}>browse</button></p>
                  </>
                ) : (
                  <div className="file-info">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="file-name">{resumeFile.name}</span>
                    <button className="remove-file" onClick={removeFile}>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="input-column">
            <div className="input-field">
              <label>Job Description</label>
              <textarea 
                className="job-description-input"
                placeholder="Paste the job description here"
                value={jobDescription}
                onChange={handleJobDescriptionChange}
                rows={6}
              ></textarea>
            </div>
          </div>
        </div>
        
        <div className="analyze-container">
          {error && <p className="error-message">{error}</p>}
          <button 
            className="analyze-button"
            onClick={analyzeMatch}
            disabled={isAnalyzing || !resumeFile || !jobDescription.trim()}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Match'}
          </button>
        </div>

        {results && (
          <div className="results-container">
            <div className="results-header">
              <div className="match-score">
                <div className="score-circle">
                  <span className="score-value">{results.matchPercentage}</span>
                  <span className="score-unit">%</span>
                </div>
                <span className="score-label">Match</span>
              </div>
            </div>
            
            <div className="results-body">
              <div className="keyword-section">
                <h2>Keyword Analysis</h2>
                <div className="keyword-columns">
                  <div className="keyword-column">
                    <h3>Found Keywords</h3>
                    <div className="keyword-tags">
                      {results.matchedKeywords.map((keyword, index) => (
                        <span key={index} className="keyword-tag matched">{keyword}</span>
                      ))}
                      {results.matchedKeywords.length === 0 && (
                        <span className="no-keywords">No matching keywords found</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="keyword-column">
                    <h3>Missing Keywords</h3>
                    <div className="keyword-tags">
                      {results.missingKeywords.map((keyword, index) => (
                        <span key={index} className="keyword-tag missing">{keyword}</span>
                      ))}
                      {results.missingKeywords.length === 0 && (
                        <span className="no-keywords">No missing keywords</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="recommendations-section">
                <h2>Recommendations</h2>
                <ul className="recommendations-list">
                  {results.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default JobMatchPage;