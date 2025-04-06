import React, { useState, useContext , useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './Home';
import FileUpload from './components/FileUpload';
import ScoreDisplay from './components/ScoreDisplay';
import ResumePreview from './components/ResumePreview';
import StatsPage from './StatsPage';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './components/ThemeToggle';
import { ThemeContext } from './ThemeContext';
import JobMatchPage from './JobMatchPage';

function ScoringPage() {
  const [file, setFile] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const navigate = useNavigate();

  const handleFileUpload = async (uploadedFile) => {
    setFile(uploadedFile);
    setLoading(true);
    setError('');
    
    try {
      // Create form data to send the file
      const formData = new FormData();
      formData.append('resume', uploadedFile);
      
      // Call to your backend API
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }
      
      const data = await response.json();
      setScore(data);
    } catch (err) {
      console.error('Error analyzing resume:', err);
      setError('Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // This applies the dark-theme class to the root html element
    if (isDarkMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  return (
    <div className="scoring-page">
      <header>
        <div className="header-left">
          <h1>Resume ATS Score</h1>
        </div>
        <div className="header-right">
         
<nav className="main-nav">
  <Link to="/" className="nav-link">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
    <span>Home</span>
  </Link>
  
  <Link to="/score" className="nav-link">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>Score</span>
  </Link>
  
  <Link to="/job-match" className="nav-link">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"></path>
    </svg>
    <span>Job Match</span>
  </Link>
  
  <Link to="/stats" className="nav-link">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10M12 20V4M6 20v-6"></path>
    </svg>
    <span>Stats</span>
  </Link>
</nav>
<ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

        </div>
      </header>
      
      <main>
        <div className="upload-section">
          <FileUpload onFileUpload={handleFileUpload} />
          {error && <p className="error-message">{error}</p>}
          {file && !loading && (
        <div className="preview-section">
          <ResumePreview file={file} />
        </div>
      )}
        </div>
        
        <div className="results-section">
          {loading ? (
            <div className="loading">Analyzing your resume...</div>
          ) : score ? (
            <ScoreDisplay score={score} />
          ) : (
            <div className="placeholder-message">
              Upload your resume to see your ATS score
            </div>
          )}
        </div>
      </main>
      
      {/* {file && !loading && (
        <div className="preview-section">
          <ResumePreview file={file} />
        </div>
      )} */}
    </div>
  );
}

function App() {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div className={`app ${isDarkMode ? 'dark-theme' : ''}`}>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/score" element={<ScoringPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/job-match" element={<JobMatchPage />} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;