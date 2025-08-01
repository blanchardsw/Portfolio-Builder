import React from 'react';
import { Education as EducationType } from '../types/portfolio';

interface EducationProps {
  education: EducationType[];
}

export const Education: React.FC<EducationProps> = ({ education }) => {
  if (!education || education.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    // Check if it's already in a readable format (e.g., "December 2015")
    if (dateString.match(/^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}$/i)) {
      return dateString;
    }
    
    // If it's just a year, return as-is
    if (dateString.match(/^\d{4}$/)) {
      return dateString;
    }
    
    // Otherwise try to parse as date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if can't parse
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  return (
    <section className="portfolio-section education">
      <h2 className="section-title">🎓 Education</h2>
      <div className="section-content">
        {education.map((edu) => (
          <div key={edu.id} className="education-item">
            <div className="education-header">
              <div className="education-title">
                <h3 className="degree">{edu.degree}</h3>
                <h4 className="field">{edu.field}</h4>
                {edu.website ? (
                  <h4 className="institution">
                    <a 
                      href={edu.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="institution-link"
                    >
                      {edu.institution}
                    </a>
                  </h4>
                ) : (
                  <h4 className="institution">{edu.institution}</h4>
                )}
              </div>
              <div className="education-meta">
                <span className="date-range">
                  {edu.endDate ? 
                    formatDate(edu.endDate) : 
                    (edu.startDate ? formatDate(edu.startDate) : '')
                  }
                </span>
                {edu.gpa && (
                  <span className="gpa">GPA: {edu.gpa}</span>
                )}
              </div>
            </div>
            
            {edu.honors && edu.honors.length > 0 && (
              <div className="education-honors">
                <span className="honors-label">Honors:</span>
                <ul>
                  {edu.honors.map((honor, index) => (
                    <li key={index}>{honor}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {edu.coursework && edu.coursework.length > 0 && (
              <div className="education-coursework">
                <span className="coursework-label">Relevant Coursework:</span>
                <div className="coursework-tags">
                  {edu.coursework.map((course, index) => (
                    <span key={index} className="coursework-tag">{course}</span>
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
