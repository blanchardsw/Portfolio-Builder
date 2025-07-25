import React from 'react';
import { Portfolio } from '../types/portfolio';

interface HeaderProps {
  portfolio: Portfolio | null;
  onUploadClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ portfolio, onUploadClick }) => {
  return (
    <header className="portfolio-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="portfolio-title">
            {portfolio?.personalInfo.name || 'Your Portfolio'}
          </h1>
          {portfolio?.personalInfo.summary && (
            <p className="portfolio-subtitle">{portfolio.personalInfo.summary}</p>
          )}
        </div>
        <div className="header-right">
          <button 
            className="upload-btn secondary"
            onClick={onUploadClick}
            title="Upload a new resume to update your portfolio"
          >
            📄 Update Resume
          </button>
        </div>
      </div>
    </header>
  );
};
