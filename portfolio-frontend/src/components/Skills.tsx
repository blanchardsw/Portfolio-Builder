import React from 'react';
import { Skill } from '../types/portfolio';

interface SkillsProps {
  skills: Skill[];
}

export const Skills: React.FC<SkillsProps> = ({ skills }) => {
  if (!skills || skills.length === 0) {
    return null;
  }

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return '💻';
      case 'soft': return '🤝';
      case 'language': return '🌍';
      default: return '⭐';
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'technical': return 'Technical Skills';
      case 'soft': return 'Soft Skills';
      case 'language': return 'Languages';
      default: return 'Skills';
    }
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
              {getCategoryIcon(category)} {getCategoryTitle(category)}
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
