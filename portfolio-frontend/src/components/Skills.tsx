import React from 'react';
import { Skill } from '../types/portfolio';

interface SkillsProps {
  skills: Skill[];
}

export const Skills: React.FC<SkillsProps> = ({ skills }) => {
  if (!skills || skills.length === 0) {
    return null;
  }

  // Group skills by category (original category name from resume)
  const groupedSkills = skills.reduce((acc, skill) => {
    const groupKey = skill.category;
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('language') || lower.includes('programming')) return '💻';
    if (lower.includes('framework') || lower.includes('library')) return '🏗️';
    if (lower.includes('database') || lower.includes('data')) return '🗄️';
    if (lower.includes('tool') || lower.includes('software')) return '🔧';
    if (lower.includes('test') || lower.includes('qa')) return '🧪';
    if (lower.includes('cloud') || lower.includes('aws') || lower.includes('azure')) return '☁️';
    if (lower.includes('web') || lower.includes('frontend') || lower.includes('ui')) return '🌐';
    if (lower.includes('backend') || lower.includes('server')) return '⚙️';
    if (lower.includes('mobile') || lower.includes('ios') || lower.includes('android')) return '📱';
    if (lower.includes('ci/cd') || lower.includes('devops') || lower.includes('deployment')) return '🚀';
    return '⭐';
  };

  const getLevelColor = (level?: string) => {
    switch (level) {
      case 'expert': return 'level-expert';
      case 'advanced': return 'level-advanced';
      case 'intermediate': return 'level-intermediate';
      case 'beginner': return 'level-beginner';
      default: return 'level-default';
    }
  };

  return (
    <section className="portfolio-section skills">
      <h2 className="section-title">🛠️ Skills</h2>
      <div className="section-content">
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <div key={category} className="skills-category">
            <h3 className="category-title">
              {getCategoryIcon(category)} {category.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
            </h3>
            <div className="skills-grid">
              {categorySkills.map((skill, index) => (
                <div key={index} className={`skill-item ${getLevelColor(skill.level)}`}>
                  <span className="skill-name">{skill.name}</span>
                  {skill.level && (
                    <span className="skill-level">{skill.level}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
