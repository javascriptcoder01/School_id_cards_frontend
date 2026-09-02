import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserTable from '../components/users/UserTable.jsx';
import UserSearch from '../components/users/UserSearch.jsx';
import UserPagination from '../components/users/UserPagination.jsx';
import UserForm from '../components/users/UserForm.jsx';
import { ROLES } from '../constants/roles.js';

describe('GROUP E — USER UI COMPONENTS & FORMS', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. UserTable renders user list with details, role badge, and actions', () => {
    const mockUsers = [
      {
        id: 'u1',
        name: 'Jane Admin',
        email: 'jane@col.edu',
        role: ROLES.COLLEGE_ADMIN,
        collegeId: 'col-123',
        isActive: true,
      },
    ];

    render(
      <MemoryRouter>
        <UserTable users={mockUsers} canEdit={true} onStatusToggle={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText('Jane Admin')).toBeInTheDocument();
    expect(screen.getByText('jane@col.edu')).toBeInTheDocument();
    expect(screen.getByText('College Admin')).toBeInTheDocument();
    expect(screen.getByText('col-123')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByTitle('View details')).toBeInTheDocument();
    expect(screen.getByTitle('Edit user')).toBeInTheDocument();
    expect(screen.getByTitle('Deactivate user')).toBeInTheDocument();
  });

  it('2. UserTable renders empty state when no users match', () => {
    render(
      <MemoryRouter>
        <UserTable users={[]} canEdit={true} />
      </MemoryRouter>
    );

    expect(screen.getByText('No Users Found')).toBeInTheDocument();
  });

  it('3. UserSearch handles search input, role filter, and status filter', async () => {
    const onSearchChange = vi.fn();
    const onRoleChange = vi.fn();
    const onStatusChange = vi.fn();

    render(
      <UserSearch
        search=""
        role=""
        isActive=""
        isSuperAdmin={true}
        onSearchChange={onSearchChange}
        onRoleChange={onRoleChange}
        onStatusChange={onStatusChange}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search by name or email/i);
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    await waitFor(
      () => {
        expect(onSearchChange).toHaveBeenCalledWith('Alice');
      },
      { timeout: 500 }
    );

    const roleSelect = screen.getByLabelText(/Filter by role/i);
    fireEvent.change(roleSelect, { target: { value: ROLES.OPERATOR } });
    expect(onRoleChange).toHaveBeenCalledWith(ROLES.OPERATOR);

    const statusSelect = screen.getByLabelText(/Filter by status/i);
    fireEvent.change(statusSelect, { target: { value: 'false' } });
    expect(onStatusChange).toHaveBeenCalledWith('false');
  });

  it('4. UserPagination handles bounds and page change events', () => {
    const onPageChange = vi.fn();

    const { rerender } = render(
      <UserPagination
        pagination={{ page: 1, limit: 10, total: 25, totalPages: 3 }}
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
      <UserPagination
        pagination={{ page: 3, limit: 10, total: 25, totalPages: 3 }}
        onPageChange={onPageChange}
      />
    );

    const updatedNextBtn = screen.getByRole('button', { name: /Next Page/i });
    expect(updatedNextBtn).toBeDisabled();
  });

  it('5. UserForm validates required fields in create mode for SUPER_ADMIN', () => {
    const onSubmit = vi.fn();

    render(
      <MemoryRouter>
        <UserForm isEdit={false} isSuperAdmin={true} onSubmit={onSubmit} />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /Create User/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Email address is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByText('Target College ID is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('6. UserForm validates invalid email format and short password', () => {
    const onSubmit = vi.fn();

    const { container } = render(
      <MemoryRouter>
        <UserForm isEdit={false} isSuperAdmin={false} onSubmit={onSubmit} />
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = container.querySelector('#user-password');
    const submitBtn = screen.getByRole('button', { name: /Create User/i });

    fireEvent.change(nameInput, { target: { value: 'Valid Name' } });
    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });

    fireEvent.click(submitBtn);

    expect(screen.getByText('Please provide a valid email address')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('7. UserForm submits sanitized payload for COLLEGE_ADMIN creating OPERATOR', () => {
    const onSubmit = vi.fn();

    const { container } = render(
      <MemoryRouter>
        <UserForm isEdit={false} isSuperAdmin={false} onSubmit={onSubmit} />
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = container.querySelector('#user-password');
    const submitBtn = screen.getByRole('button', { name: /Create User/i });

    fireEvent.change(nameInput, { target: { value: '  John Operator  ' } });
    fireEvent.change(emailInput, { target: { value: 'JOHN.OP@COLLEGE.EDU' } });
    fireEvent.change(passwordInput, { target: { value: 'Secr3tP@ssword' } });

    fireEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'John Operator',
      email: 'john.op@college.edu',
      password: 'Secr3tP@ssword',
      role: ROLES.OPERATOR,
    });
  });
});

