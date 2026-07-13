import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HeroSection from './HeroSection';
import { BrowserRouter } from 'react-router-dom';

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('HeroSection', () => {
  it('renders the main heading', () => {
    renderWithRouter(<HeroSection />);
    expect(screen.getByText(/The Database Schema/i)).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    renderWithRouter(<HeroSection />);
    expect(screen.getByText(/Paste SQL, get an instant health score/i)).toBeInTheDocument();
  });

  it('renders the Analyze Schema link', () => {
    renderWithRouter(<HeroSection />);
    expect(screen.getByText('Analyze Schema')).toHaveAttribute('href', '/analyze');
  });

  it('renders the GitHub link', () => {
    renderWithRouter(<HeroSection />);
    expect(screen.getByText('View on GitHub')).toHaveAttribute('href', 'https://github.com/debudebuye/fixmydb');
  });
});
