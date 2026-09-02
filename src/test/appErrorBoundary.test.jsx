import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AppErrorBoundary from '../components/common/AppErrorBoundary.jsx';

const ProblemChild = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Fatal UI Render Crash with sensitive Mongo internal /db/model.js:55');
  }
  return <div>Healthy UI Content</div>;
};

const ResettableApp = () => {
  const [shouldThrow, setShouldThrow] = useState(true);

  return (
    <div>
      <button onClick={() => setShouldThrow(false)}>Resolve Problem</button>
      <AppErrorBoundary>
        <ProblemChild shouldThrow={shouldThrow} />
      </AppErrorBoundary>
    </div>
  );
};

describe('GLOBAL REACT ERROR BOUNDARY & RECOVERY', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => { });
    vi.spyOn(console, 'error').mockImplementation(() => { });
  });

  it('1. Catches render crash and displays safe fallback UI', () => {
    render(
      <AppErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </AppErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });

  it('2. Does NOT expose error stack or raw internal file paths in DOM', () => {
    const { container } = render(
      <AppErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </AppErrorBoundary>
    );

    expect(container.innerHTML).not.toContain('/db/model.js');
    expect(container.innerHTML).not.toContain('Fatal UI Render Crash');
  });

  it('3. Resets and recovers when retry action is clicked after problem resolution', () => {
    render(<ResettableApp />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // 1. Resolve child error state
    fireEvent.click(screen.getByText('Resolve Problem'));

    // 2. Click retry in Error Boundary
    fireEvent.click(screen.getByRole('button', { name: /Try Again/i }));

    expect(screen.getByText('Healthy UI Content')).toBeInTheDocument();
  });
});

