import React, { useState, useCallback, memo } from 'react';
import { PersonalInfo as PersonalInfoType } from '../types/portfolio';

interface PersonalInfoProps {
  personalInfo: PersonalInfoType;
}

/**
 * PersonalInfo component displays personal information with advanced performance optimizations.
 * 
 * **Performance Optimizations Implemented:**
 * 
 * **React.memo**: Prevents unnecessary re-renders when props haven't changed
 * - Only re-renders if personalInfo object reference changes
 * - Significantly improves performance in parent component updates
 * - Essential for components that receive complex objects as props
 * 
 * **useCallback**: Memoizes event handlers to prevent child re-renders
 * - Image load/error handlers are memoized to maintain referential equality
 * - Prevents unnecessary re-creation of functions on each render
 * - Critical for performance when handlers are passed to child components
 * 
 * **Lazy Image Loading**: Optimizes image loading with progressive enhancement
 * - Shows loading placeholder while image loads
 * - Graceful error handling with fallback UI
 * - Improves perceived performance and user experience
 * - Prevents layout shift during image loading
 * 
 * **State Management**: Minimal state for image loading states
 * - Tracks loading and error states independently
 * - Enables fine-grained UI control and user feedback
 * 
 * @param {PersonalInfoProps} props - Component props
 * @param {PersonalInfoType} props.personalInfo - Personal information data
 * @returns {JSX.Element} Rendered personal information section
 * 
 * @example
 * ```tsx
 * const personalData = {
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   profilePhoto: 'https://example.com/photo.jpg',
 *   // ... other fields
 * };
 * 
 * <PersonalInfo personalInfo={personalData} />
 * ```
 */
const PersonalInfo: React.FC<PersonalInfoProps> = memo(({ personalInfo }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  /**
   * Handles image load event.
   * 
   * Sets imageLoaded state to true when image is loaded.
   */
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  return (
    <section className="portfolio-section personal-info">
      <div className="section-content">
        <div className="personal-header">
          {personalInfo.profilePhoto && !imageError && (
            <div className="profile-photo">
              {!imageLoaded && (
                <div className="profile-image-placeholder">
                  <div className="loading-spinner"></div>
                </div>
              )}
              <img 
                src={personalInfo.profilePhoto} 
                alt={`${personalInfo.name} profile photo`}
                className={`profile-image ${imageLoaded ? 'loaded' : 'loading'}`}
                loading="lazy"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ display: imageLoaded ? 'block' : 'none' }}
              />
            </div>
          )}
          <div className="personal-text">
            <h1 className="name">{personalInfo.name}</h1>
            {personalInfo.summary && (
              <p className="summary">{personalInfo.summary}</p>
            )}
          </div>
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
});

export { PersonalInfo };
