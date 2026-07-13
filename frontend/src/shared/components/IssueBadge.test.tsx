import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import IssueBadge from './IssueBadge';

describe('IssueBadge', () => {
  it('renders HIGH badge for high severity', () => {
    render(<IssueBadge severity="high" />);
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('renders MED badge for medium severity', () => {
    render(<IssueBadge severity="medium" />);
    expect(screen.getByText('MED')).toBeInTheDocument();
  });

  it('renders LOW badge for low severity', () => {
    render(<IssueBadge severity="low" />);
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });

  it('applies correct CSS class for each severity', () => {
    const { rerender } = render(<IssueBadge severity="high" />);
    expect(screen.getByText('HIGH')).toHaveClass('badge-red');

    rerender(<IssueBadge severity="medium" />);
    expect(screen.getByText('MED')).toHaveClass('badge-yellow');

    rerender(<IssueBadge severity="low" />);
    expect(screen.getByText('LOW')).toHaveClass('badge-blue');
  });
});
