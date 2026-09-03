import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import PrintDispatchModal from '../components/printRequests/PrintDispatchModal.jsx';
import SuperAdminPrintQueueTable from '../components/printRequests/SuperAdminPrintQueueTable.jsx';
import printRequestReducer from '../features/printRequests/printRequestSlice.js';
import { PRINT_REQUEST_STATUS } from '../constants/printRequest.js';

describe('Advanced Print Fulfillment & Dispatch (Batch 19)', () => {
  describe('PrintDispatchModal Component', () => {
    it('renders print modes and allows submitting selected print mode', () => {
      const onConfirm = vi.fn();
      const onClose = vi.fn();

      render(
        <PrintDispatchModal
          isOpen={true}
          requestId="PR-5001"
          collegeName="Greenwood High"
          totalCards={120}
          onConfirm={onConfirm}
          onClose={onClose}
        />
      );

      expect(screen.getByText(/Dispatch Print Production/i)).toBeDefined();
      expect(screen.getByText('PR-5001')).toBeDefined();
      expect(screen.getByText('Greenwood High')).toBeDefined();
      expect(screen.getByText('120 ID cards')).toBeDefined();

      // Check print mode options
      expect(screen.getByText(/System Print Dialog/i)).toBeDefined();
      expect(screen.getByText(/External Commercial Printer/i)).toBeDefined();
      expect(screen.getByText(/Direct Production Dispatch/i)).toBeDefined();

      // Select External Printer
      const externalPrinterRadio = screen.getByLabelText(/External Commercial Printer/i);
      fireEvent.click(externalPrinterRadio);

      // Submit
      const submitBtn = screen.getByRole('button', { name: /Start Printing/i });
      fireEvent.click(submitBtn);

      expect(onConfirm).toHaveBeenCalledWith({
        printMode: 'EXTERNAL_PRINTER',
        notes: '',
      });
    });

    it('returns null when isOpen is false', () => {
      const { container } = render(
        <PrintDispatchModal isOpen={false} onConfirm={vi.fn()} onClose={vi.fn()} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('SuperAdminPrintQueueTable Actions', () => {
    const mockRequests = [
      {
        id: 'pr-1',
        status: PRINT_REQUEST_STATUS.SENT_TO_SUPER_ADMIN,
        totalCards: 50,
        createdAt: new Date().toISOString(),
        collegeId: { name: 'Apex Academy', code: 'APX' },
        requestedBy: { name: 'Teacher A', subjectName: 'Science', className: '9', sectionName: 'A' },
      },
      {
        id: 'pr-2',
        status: PRINT_REQUEST_STATUS.SUPER_ADMIN_APPROVED,
        totalCards: 30,
        createdAt: new Date().toISOString(),
        collegeId: { name: 'Apex Academy', code: 'APX' },
        requestedBy: { name: 'Teacher B', subjectName: 'Math', className: '10', sectionName: 'B' },
      },
      {
        id: 'pr-3',
        status: PRINT_REQUEST_STATUS.PRINTING,
        totalCards: 45,
        createdAt: new Date().toISOString(),
        collegeId: { name: 'Apex Academy', code: 'APX' },
        requestedBy: { name: 'Teacher C', subjectName: 'English', className: '11', sectionName: 'C' },
      },
    ];

    it('renders Approve/Reject for SENT_TO_SUPER_ADMIN, Dispatch Print for SUPER_ADMIN_APPROVED, and PDF/ZIP/Complete for PRINTING', () => {
      const store = configureStore({
        reducer: {
          printRequests: printRequestReducer,
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <SuperAdminPrintQueueTable requests={mockRequests} />
          </MemoryRouter>
        </Provider>
      );

      // Sent to Super Admin actions
      expect(screen.getByRole('button', { name: /Approve/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Reject/i })).toBeDefined();

      // Super Admin Approved actions
      expect(screen.getByRole('button', { name: /Dispatch Print/i })).toBeDefined();

      // Printing actions
      expect(screen.getByRole('button', { name: /PDF/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /ZIP/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Complete/i })).toBeDefined();
    });
  });
});
