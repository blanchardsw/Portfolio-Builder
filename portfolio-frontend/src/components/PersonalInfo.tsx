import React from 'react';
import { PersonalInfo as PersonalInfoType } from '../types/portfolio';

interface PersonalInfoProps {
  personalInfo: PersonalInfoType;
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({ personalInfo }) => {
  return (
    <section className="portfolio-section personal-info">
      <div className="section-content">
        <div className="personal-header">
          <h1 className="name">{personalInfo.name}</h1>
          {personalInfo.summary && (
            <p className="summary">{personalInfo.summary}</p>
          )}
        </div>
        
        <div className="contact-info">
          {personalInfo.email && (
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a>
            </div>
          )}
          
          {personalInfo.phone && (
            <div className="contact-item">
              <span className="contact-icon">📱</span>
              <a href={`tel:${personalInfo.phone}`}>{personalInfo.phone}</a>
            </div>
          )}
          
          {personalInfo.location && (
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <span>{personalInfo.location}</span>
            </div>
          )}
          
          {personalInfo.linkedin && (
            <div className="contact-item">
              <span className="contact-icon">💼</span>
              <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </div>
          )}
          
          {personalInfo.github && (
            <div className="contact-item">
              <span className="contact-icon">⚡</span>
              <a href={personalInfo.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </div>
          )}
          
          {personalInfo.website && (
            <div className="contact-item">
              <span className="contact-icon">🌐</span>
              <a href={personalInfo.website} target="_blank" rel="noopener noreferrer">
                Website
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
