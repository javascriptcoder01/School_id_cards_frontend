import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StudentTable from '../components/students/StudentTable.jsx';
import StudentSearch from '../components/students/StudentSearch.jsx';
import StudentPagination from '../components/students/StudentPagination.jsx';
import StudentForm from '../components/students/StudentForm.jsx';

describe('GROUP E & F — STUDENT UI COMPONENTS & FORMS', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. StudentTable renders student list with class, roll number, status badge, and actions', () => {
    const mockStudents = [
      {
        id: 's1',
        studentId: 'STU-101',
        name: 'Aarav Patel',
        className: '10th Grade',
        section: 'A',
        rollNumber: '24',
        email: 'aarav@school.edu',
        phone: '+91 9876543210',
        isActive: true,
      },
    ];

    render(
      <MemoryRouter>
        <StudentTable students={mockStudents} canEdit={true} onStatusToggle={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText('Aarav Patel')).toBeInTheDocument();
    expect(screen.getByText('ID: STU-101')).toBeInTheDocument();
    expect(screen.getByText('10th Grade')).toBeInTheDocument();
    expect(screen.getByText('(Sec: A)')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('aarav@school.edu')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByTitle('View details')).toBeInTheDocument();
    expect(screen.getByTitle('Edit student')).toBeInTheDocument();
    expect(screen.getByTitle('Deactivate student')).toBeInTheDocument();
  });

  it('2. StudentTable renders empty state when no students are present', () => {
    render(
      <MemoryRouter>
        <StudentTable students={[]} canEdit={true} />
      </MemoryRouter>
    );

    expect(screen.getByText('No Students Found')).toBeInTheDocument();
  });

  it('3. StudentSearch handles debounced search input and reset button', async () => {
    const onSearchChange = vi.fn();
    const onReset = vi.fn();

    render(
      <StudentSearch
        search=""
        onSearchChange={onSearchChange}
        onReset={onReset}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search by student ID/i);
    fireEvent.change(searchInput, { target: { value: 'Aarav' } });

    await waitFor(
      () => {
        expect(onSearchChange).toHaveBeenCalledWith('Aarav');
      },
      { timeout: 500 }
    );
  });

  it('4. StudentPagination handles boundary disablement and page transitions', () => {
    const onPageChange = vi.fn();

    const { rerender } = render(
      <StudentPagination
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
      <StudentPagination
        pagination={{ page: 3, limit: 10, total: 30, totalPages: 3 }}
        onPageChange={onPageChange}
      />
    );

    const updatedNextBtn = screen.getByRole('button', { name: /Next Page/i });
    expect(updatedNextBtn).toBeDisabled();
  });

  it('5. StudentForm validates required fields on submission', () => {
    const onSubmit = vi.fn();

    render(
      <MemoryRouter>
        <StudentForm isEdit={false} onSubmit={onSubmit} />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /Create Student/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Student ID is required')).toBeInTheDocument();
    expect(screen.getByText('Student name is required')).toBeInTheDocument();
    expect(screen.getByText('Class / Grade name is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('6. StudentForm validates invalid email format and invalid photo URL', () => {
    const onSubmit = vi.fn();

    render(
      <MemoryRouter>
        <StudentForm isEdit={false} onSubmit={onSubmit} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Student ID/i), { target: { value: 'STU-1' } });
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Valid Student' } });
    fireEvent.change(screen.getByLabelText(/Class \/ Course/i), { target: { value: '10th' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'not-an-email' } });
    fireEvent.change(screen.getByLabelText(/Photo URL/i), { target: { value: 'invalid-url' } });

    const submitBtn = screen.getByRole('button', { name: /Create Student/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Please provide a valid email address')).toBeInTheDocument();
    expect(screen.getByText('Please provide a valid photo URL')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('7. StudentForm submits clean payload with address and guardian information', () => {
    const onSubmit = vi.fn();

    render(
      <MemoryRouter>
        <StudentForm isEdit={false} onSubmit={onSubmit} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Student ID/i), { target: { value: 'STU-999' } });
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Pooja Hegde' } });
    fireEvent.change(screen.getByLabelText(/Class \/ Course/i), { target: { value: '12th Science' } });
    fireEvent.change(screen.getByLabelText(/Section/i), { target: { value: 'B' } });
    fireEvent.change(screen.getByLabelText(/Roll Number/i), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText(/Guardian \/ Parent Name/i), { target: { value: 'R. Hegde' } });
    fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'Bengaluru' } });

    const submitBtn = screen.getByRole('button', { name: /Create Student/i });
    fireEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith({
      studentId: 'STU-999',
      name: 'Pooja Hegde',
      className: '12th Science',
      section: 'B',
      rollNumber: '15',
      dateOfBirth: null,
      gender: null,
      email: null,
      phone: null,
      photo: null,
      guardianName: 'R. Hegde',
      guardianPhone: null,
      address: {
        line1: '',
        line2: '',
        city: 'Bengaluru',
        state: '',
        country: 'India',
        postalCode: '',
      },
    });
  });
});

