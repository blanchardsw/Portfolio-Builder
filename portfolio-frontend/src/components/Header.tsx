import React, { useState, useEffect } from 'react';
import { Portfolio } from '../types/portfolio';

interface HeaderProps {
  portfolio: Portfolio | null;
  onUploadClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ portfolio, onUploadClick }) => {
  const [isOwner, setIsOwner] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Securely validate owner access via backend
  useEffect(() => {
    const validateOwnerAccess = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const key = urlParams.get('key');
      
      if (!key) {
        setIsOwner(false);
        return;
      }

      setIsValidating(true);
      try {
        const response = await fetch(`http://localhost:3001/api/auth/check-owner/${encodeURIComponent(key)}`);
        const data = await response.json();
        setIsOwner(data.isOwner);
        
        if (data.isOwner) {
          console.log('✅ Owner access granted');
        }
      } catch (error) {
        console.error('Failed to validate owner access:', error);
        setIsOwner(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateOwnerAccess();
  }, []);

  return (
    <header className="portfolio-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="portfolio-title">
            {portfolio?.personalInfo.name || 'Your Portfolio'}
          </h1>
        </div>
        <div className="header-right">
          {isOwner && (
            <button 
              className="upload-btn secondary"
              onClick={onUploadClick}
              title="Upload a new resume to update your portfolio"
            >
              📄 Update Resume
            </button>
          )}
          {isValidating && (
            <span className="validating-text">Validating access...</span>
          )}
        </div>
      </div>
    </header>
  );
};
