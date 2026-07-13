import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Footer from './Footer';

describe('Footer', () => {
  it('renders the project name and license', () => {
    render(<Footer />);
    expect(screen.getByText(/FixMyDB · Open Source · MIT License/)).toBeInTheDocument();
  });

  it('renders the download link', () => {
    render(<Footer />);
    expect(screen.getByText('Download Desktop App')).toHaveAttribute(
      'href',
      'https://github.com/debudebuye/fixmydb/releases'
    );
  });

  it('renders the tagline', () => {
    render(<Footer />);
    expect(screen.getByText(/Like ESLint — but for database architecture/)).toBeInTheDocument();
  });

  it('copy button is clickable', async () => {
    vi.stubEnv('VITE_BINANCE_ID', '');
    render(<Footer />);
    // When VITE_BINANCE_ID is not set, the donation section is not rendered
    expect(screen.queryByText('Support FixMyDB')).not.toBeInTheDocument();
    vi.unstubAllEnvs();
  });
});
