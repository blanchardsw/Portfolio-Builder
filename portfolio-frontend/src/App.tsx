import React, { useState, useEffect } from 'react';
import './App.css';
import { Portfolio } from './types/portfolio';
import { Header } from './components/Header';
import { PersonalInfo } from './components/PersonalInfo';
import { WorkExperience } from './components/WorkExperience';
import { Education } from './components/Education';
import { Skills } from './components/Skills';
import { ResumeUpload } from './components/ResumeUpload';
import { portfolioApi } from './services/api';

function App() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const data = await portfolioApi.getPortfolio();
      setPortfolio(data);
      setError(null);
    } catch (err) {
      console.log('No portfolio data found - showing upload option');
      setError('No portfolio data found. Please upload your resume to get started.');
      setShowUpload(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUploaded = (newPortfolio: Portfolio) => {
    setPortfolio(newPortfolio);
    setShowUpload(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading your portfolio...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Header 
        portfolio={portfolio} 
        onUploadClick={() => setShowUpload(true)}
      />
      
      {showUpload && (
        <ResumeUpload 
          onUploadSuccess={handleResumeUploaded}
          onClose={() => setShowUpload(false)}
        />
      )}
      
      {error && !portfolio ? (
        <div className="welcome-section">
          <div className="welcome-content">
            <h1>Welcome to Your Portfolio</h1>
            <p>{error}</p>
            <button 
              className="upload-btn primary"
              onClick={() => setShowUpload(true)}
            >
              📄 Upload Resume
            </button>
          </div>
        </div>
      ) : portfolio ? (
        <main className="portfolio-content">
          <PersonalInfo personalInfo={portfolio.personalInfo} />
          <WorkExperience experiences={portfolio.workExperience} />
          <Education education={portfolio.education} />
          <Skills skills={portfolio.skills} />
        </main>
      ) : null}
      
      <footer className="app-footer">
        <p>Last updated: {portfolio?.lastUpdated ? new Date(portfolio.lastUpdated).toLocaleDateString() : 'Never'}</p>
      </footer>
    </div>
  );
}

export default App;
