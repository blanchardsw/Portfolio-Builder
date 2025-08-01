import React from 'react';
import { WorkExperience as WorkExperienceType } from '../types/portfolio';

interface WorkExperienceProps {
  experiences: WorkExperienceType[];
}

export const WorkExperience: React.FC<WorkExperienceProps> = ({ experiences }) => {
  if (!experiences || experiences.length === 0) {
    return null;
  }

  function normalizeUrl(url?: string): string {
    if (!url) return '#';
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  }  

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <section className="portfolio-section work-experience">
      <h2 className="section-title">💼 Work Experience</h2>
      <div className="section-content">
        {experiences.map((experience) => (
          <div key={experience.id} className="experience-item">
            <div className="experience-header">
              <div className="experience-title">
                <h3 className="position">{experience.position}</h3>
                {experience.website ? (
                  <h4 className="company">
                    <a 
                      href={normalizeUrl(experience.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="company-link"
                    >
                      {experience.company}
                    </a>
                  </h4>
                ) : (
                  <h4 className="company">{experience.company}</h4>
                )}
              </div>
              <div className="experience-meta">
                <span className="date-range">
                  {formatDate(experience.startDate)} - {
                    experience.current ? 'Present' : formatDate(experience.endDate || '')
                  }
                </span>
                {experience.location && (
                  <span className="location">📍 {experience.location}</span>
                )}
              </div>
            </div>
            
            {experience.description && experience.description.length > 0 && (
              <div className="experience-description">
                <ul>
                  {experience.description.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {experience.technologies && experience.technologies.length > 0 && (
              <div className="experience-technologies">
                <span className="tech-label">Technologies:</span>
                <div className="tech-tags">
                  {experience.technologies.map((tech, index) => (
                    <span key={index} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
