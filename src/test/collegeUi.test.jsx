import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CollegeTable from '../components/colleges/CollegeTable.jsx';
import CollegeSearch from '../components/colleges/CollegeSearch.jsx';
import CollegePagination from '../components/colleges/CollegePagination.jsx';
import CollegeForm from '../components/colleges/CollegeForm.jsx';

describe('GROUP E & F — COLLEGE UI COMPONENTS & FORMS', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. CollegeTable renders college list with details and actions', () => {
    const mockColleges = [
      {
        _id: 'col-1',
        name: 'Tech Institute',
        code: 'TI01',
        isActive: true,
        address: { city: 'Mumbai', state: 'Maharashtra' },
        contact: { email: 'info@ti.edu', phone: '+919999999999' },
      },
    ];

    render(
      <MemoryRouter>
        <CollegeTable colleges={mockColleges} isSuperAdmin={true} onStatusToggle={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText('Tech Institute')).toBeInTheDocument();
    expect(screen.getByText('TI01')).toBeInTheDocument();
    expect(screen.getByText('Mumbai, Maharashtra')).toBeInTheDocument();
    expect(screen.getByText('info@ti.edu')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByTitle('View details')).toBeInTheDocument();
    expect(screen.getByTitle('Edit college')).toBeInTheDocument();
    expect(screen.getByTitle('Deactivate college')).toBeInTheDocument();
  });

  it('2. CollegeTable renders empty state when no colleges exist', () => {
    render(
      <MemoryRouter>
        <CollegeTable colleges={[]} isSuperAdmin={true} />
      </MemoryRouter>
    );

    expect(screen.getByText('No Colleges Found')).toBeInTheDocument();
  });

  it('3. CollegeSearch handles status filter changes and search input', async () => {
    const onSearchChange = vi.fn();
    const onStatusChange = vi.fn();

    render(
      <CollegeSearch
        search=""
        isActive=""
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search by college name or code/i);
    fireEvent.change(searchInput, { target: { value: 'Delhi' } });

    await waitFor(
      () => {
        expect(onSearchChange).toHaveBeenCalledWith('Delhi');
      },
      { timeout: 500 }
    );

    const selectEl = screen.getByLabelText(/Filter by status/i);
    fireEvent.change(selectEl, { target: { value: 'true' } });
    expect(onStatusChange).toHaveBeenCalledWith('true');
  });

  it('4. CollegePagination disables boundaries and triggers page changes', () => {
    const onPageChange = vi.fn();

    const { rerender } = render(
      <CollegePagination
        pagination={{ page: 1, limit: 10, total: 30, totalPages: 3 }}
        onPageChange={onPageChange}
      />
    );

    const prevBtn = screen.getByRole('button', { name: /Previous Page/i });
    const nextBtn = screen.getByRole('button', { name: /Next Page/i });

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeEnabled();

    fireEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledWith(2);

    rerender(
      <CollegePagination
        pagination={{ page: 3, limit: 10, total: 30, totalPages: 3 }}
        onPageChange={onPageChange}
      />
    );

    const updatedNextBtn = screen.getByRole('button', { name: /Next Page/i });
    expect(updatedNextBtn).toBeDisabled();
  });

  it('5. CollegeForm validates required fields and malformed email/URL', () => {
    const onSubmit = vi.fn();

    render(
      <MemoryRouter>
        <CollegeForm onSubmit={onSubmit} />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /Create College/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('College name is required')).toBeInTheDocument();
    expect(screen.getByText('College code is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    // Input invalid email
    const emailInput = screen.getByLabelText(/Contact Email/i);
    fireEvent.change(emailInput, { target: { value: 'bad-email' } });
    fireEvent.click(submitBtn);
    expect(screen.getByText('Please provide a valid contact email address')).toBeInTheDocument();

    // Input invalid logo URL
    const logoInput = screen.getByLabelText(/Logo URL/i);
    fireEvent.change(logoInput, { target: { value: 'not-a-url' } });
    fireEvent.click(submitBtn);
    expect(screen.getByText('Please provide a valid URL for the logo')).toBeInTheDocument();
  });

  it('6. CollegeForm submits sanitized data and auto-uppercases code', () => {
    const onSubmit = vi.fn();

    render(
      <MemoryRouter>
        <CollegeForm onSubmit={onSubmit} />
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText(/College Name/i);
    const codeInput = screen.getByLabelText(/College Code/i);
    const submitBtn = screen.getByRole('button', { name: /Create College/i });

    fireEvent.change(nameInput, { target: { value: '  Indian Institute of Science  ' } });
    fireEvent.change(codeInput, { target: { value: 'iisc' } });

    fireEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Indian Institute of Science',
        code: 'IISC',
      })
    );
  });
});

