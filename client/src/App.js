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
      const response = await fetch('http://localhost:3001/api/analyze-resume', {
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
          <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          <nav>
            <Link to="/">Home</Link>
            <Link to="/stats">Stats</Link>
          </nav>
        </div>
      </header>
      
      <main>
        <div className="upload-section">
          <FileUpload onFileUpload={handleFileUpload} />
          {error && <p className="error-message">{error}</p>}
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
      
      {file && !loading && (
        <div className="preview-section">
          <ResumePreview file={file} />
        </div>
      )}
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
      </Routes>
    </Router>
    </div>
  );
}

export default App;