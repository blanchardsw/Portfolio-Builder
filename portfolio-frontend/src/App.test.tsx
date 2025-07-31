import { render } from '@testing-library/react';
import App from './App';
import { ThemeContext } from './context/ThemeContext';

describe('App Component', () => {
  test('renders without crashing', () => {
    const mockThemeContext = {
      theme: 'light' as const,
      toggleTheme: jest.fn(),
    };

    render(
      <ThemeContext.Provider value={mockThemeContext}>
        <App />
      </ThemeContext.Provider>
    );
  });
});