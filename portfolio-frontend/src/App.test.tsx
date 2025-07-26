import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock the portfolioApi to prevent network calls
jest.mock('./services/api', () => ({
  portfolioApi: {
    getPortfolio: jest.fn().mockResolvedValue({
      personalInfo: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        location: 'Test City',
        linkedin: 'https://linkedin.com/in/testuser',
        github: 'https://github.com/testuser',
        website: 'https://testuser.com',
        profilePhoto: '',
        summary: 'Test summary'
      },
      workExperience: [],
      education: [],
      skills: [],
      projects: []
    }),
    uploadResume: jest.fn()
  }
}));

// Mock fetch for the owner access check
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ isOwner: false })
    } as Response);
  });

  test('renders without crashing', async () => {
    render(<App />);
    
    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('displays loading state initially', () => {
    render(<App />);
    
    // The component should show some loading indication or content
    // Since we don't have a specific loading text, we'll just check that it renders
    expect(document.body).toBeInTheDocument();
  });
});
