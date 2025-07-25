import express from 'express';
import { PortfolioService } from '../services/portfolioService';

const router = express.Router();
const portfolioService = new PortfolioService();

// Get complete portfolio data
router.get('/', async (req, res) => {
  try {
    const portfolio = await portfolioService.getPortfolio();
    
    if (!portfolio) {
      return res.status(404).json({ 
        error: 'No portfolio data found',
        message: 'Please upload a resume to populate your portfolio'
      });
    }
    
    res.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
});

// Get personal information only
router.get('/personal', async (req, res) => {
  try {
    const portfolio = await portfolioService.getPortfolio();
    
    if (!portfolio) {
      return res.status(404).json({ error: 'No portfolio data found' });
    }
    
    res.json(portfolio.personalInfo);
  } catch (error) {
    console.error('Error fetching personal info:', error);
    res.status(500).json({ error: 'Failed to fetch personal information' });
  }
});

// Get work experience only
router.get('/experience', async (req, res) => {
  try {
    const portfolio = await portfolioService.getPortfolio();
    
    if (!portfolio) {
      return res.status(404).json({ error: 'No portfolio data found' });
    }
    
    res.json(portfolio.workExperience);
  } catch (error) {
    console.error('Error fetching work experience:', error);
    res.status(500).json({ error: 'Failed to fetch work experience' });
  }
});

// Get education only
router.get('/education', async (req, res) => {
  try {
    const portfolio = await portfolioService.getPortfolio();
    
    if (!portfolio) {
      return res.status(404).json({ error: 'No portfolio data found' });
    }
    
    res.json(portfolio.education);
  } catch (error) {
    console.error('Error fetching education:', error);
    res.status(500).json({ error: 'Failed to fetch education data' });
  }
});

// Get skills only
router.get('/skills', async (req, res) => {
  try {
    const portfolio = await portfolioService.getPortfolio();
    
    if (!portfolio) {
      return res.status(404).json({ error: 'No portfolio data found' });
    }
    
    res.json(portfolio.skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills data' });
  }
});

// Get projects only
router.get('/projects', async (req, res) => {
  try {
    const portfolio = await portfolioService.getPortfolio();
    
    if (!portfolio) {
      return res.status(404).json({ error: 'No portfolio data found' });
    }
    
    res.json(portfolio.projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects data' });
  }
});

// Update personal information
router.put('/personal', async (req, res) => {
  try {
    const updates = { personalInfo: req.body };
    const portfolio = await portfolioService.updatePortfolio(updates);
    
    res.json({
      message: 'Personal information updated successfully',
      personalInfo: portfolio.personalInfo
    });
  } catch (error) {
    console.error('Error updating personal info:', error);
    res.status(500).json({ error: 'Failed to update personal information' });
  }
});

// Add new work experience
router.post('/experience', async (req, res) => {
  try {
    const portfolio = await portfolioService.getPortfolio();
    
    if (!portfolio) {
      return res.status(404).json({ error: 'No portfolio data found' });
    }
    
    const newExperience = {
      id: `exp_${Date.now()}`,
      ...req.body
    };
    
    portfolio.workExperience.push(newExperience);
    
    const updatedPortfolio = await portfolioService.updatePortfolio({
      workExperience: portfolio.workExperience
    });
    
    res.json({
      message: 'Work experience added successfully',
      experience: newExperience
    });
  } catch (error) {
    console.error('Error adding work experience:', error);
    res.status(500).json({ error: 'Failed to add work experience' });
  }
});

// Update work experience
router.put('/experience/:id', async (req, res) => {
  try {
    const portfolio = await portfolioService.getPortfolio();
    
    if (!portfolio) {
      return res.status(404).json({ error: 'No portfolio data found' });
    }
    
    const experienceIndex = portfolio.workExperience.findIndex(exp => exp.id === req.params.id);
    
    if (experienceIndex === -1) {
      return res.status(404).json({ error: 'Work experience not found' });
    }
    
    portfolio.workExperience[experienceIndex] = {
      ...portfolio.workExperience[experienceIndex],
      ...req.body
    };
    
    const updatedPortfolio = await portfolioService.updatePortfolio({
      workExperience: portfolio.workExperience
    });
    
    res.json({
      message: 'Work experience updated successfully',
      experience: portfolio.workExperience[experienceIndex]
    });
  } catch (error) {
    console.error('Error updating work experience:', error);
    res.status(500).json({ error: 'Failed to update work experience' });
  }
});

// Delete work experience
router.delete('/experience/:id', async (req, res) => {
  try {
    const portfolio = await portfolioService.getPortfolio();
    
    if (!portfolio) {
      return res.status(404).json({ error: 'No portfolio data found' });
    }
    
    portfolio.workExperience = portfolio.workExperience.filter(exp => exp.id !== req.params.id);
    
    await portfolioService.updatePortfolio({
      workExperience: portfolio.workExperience
    });
    
    res.json({ message: 'Work experience deleted successfully' });
  } catch (error) {
    console.error('Error deleting work experience:', error);
    res.status(500).json({ error: 'Failed to delete work experience' });
  }
});

export { router as portfolioRouter };
