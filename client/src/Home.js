import React ,{ useContext } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import { ThemeContext } from './ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import ATSScoreGauge from './components/ATSScoreGauge';

import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  
  const goToScorePage = () => {
    navigate('/score');
  };
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }
  return (
    <div className="home-container">
      <header className="home-header">
        <div className="logo">ATS Score</div>
        <div className="header-right">
    <nav className="main-nav">
      <button className="nav-button" onClick={() => navigate('/score')}>Score Resume</button>
      <button className="nav-button" onClick={() => navigate('/job-match')}>Job Match</button>
    </nav>
    <button className="cta-button" onClick={goToScorePage}>Get Score Now</button>
    <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

  </div>
      </header>

      <main className="home-main">
        <section className="hero-section">
          <h1>Make your resume ATS-friendly.</h1>
          <p className="subtitle">
            Analyze your resume against Applicant Tracking Systems and increase your chances of getting interviews.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={goToScorePage} >Upload Resume</button>
            <button className="secondary-button" onClick={() => scrollToSection('info-section')}>Learn More ↓</button>
          </div>
        </section>

        <section className="info-section" >
          <h2>Why ATS Score Matters</h2>
          
          <div className="info-grid">
            <div className="info-card">
              <div className="info-number">75%</div>
              <p>of resumes are rejected by ATS before a human ever sees them</p>
            </div>
            <div className="info-card">
              <div className="info-number">95%</div>
              <p>of Fortune 500 companies use ATS to filter candidates</p>
            </div>
            <div className="info-card">
              <div className="info-number">3×</div>
              <p>higher interview rate with an ATS-optimized resume</p>
            </div>
            <div className="info-card">
  <div className="info-number">68%</div>
  <p>of hiring managers say an ATS-friendly resume improves candidate quality</p>
</div>
          </div>
        </section>

        <section className="factors-section">
          <h2>Key Factors in ATS Scoring</h2>
          <div className="factors-grid" id="info-section">
            <div className="factor-card">
              <h3>Formatting</h3>
              <p>Simple, clean layouts without tables, graphics, or complex formatting elements are preferred by ATS systems.</p>
            </div>
            <div className="factor-card">
              <h3>Keywords</h3>
              <p>Including relevant industry and job-specific keywords that match the job description improves visibility.</p>
            </div>
            <div className="factor-card" >
              <h3>Section Headings</h3>
              <p>Clear, standard section headings (Experience, Education, Skills) help ATS properly categorize your information.</p>
            </div>
            <div className="factor-card">
              <h3>File Format</h3>
              <p>Standard file formats like .docx or .pdf are most compatible with ATS systems.</p>
            </div>
            <div className="factor-card">
              <h3>Contact Information</h3>
              <p>Complete, properly formatted contact details ensure employers can reach you.</p>
            </div>
            <div className="factor-card">
              <h3>Content Quality</h3>
              <p>Concrete achievements and quantifiable results enhance both ATS scoring and human review.</p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2>Ready to optimize your resume?</h2>
          <p>Upload your resume now to get your ATS compatibility score and personalized recommendations.</p>
          <button className="primary-button large" onClick={goToScorePage} >Check Your Resume Now</button>
        </section>
      </main>

      <footer className="home-footer">
        <p>© 2025 ATS Score. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="https://www.linkedin.com/in/dharmatejasamudrala/">Contact</a>
          <a href="#">Terms</a>
          <a href="#">About</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;