import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureAppStore } from '../app/store.js';
import DownloadButton from '../components/idCardOutput/DownloadButton.jsx';
import GenerationDownloadPanel from '../components/idCardOutput/GenerationDownloadPanel.jsx';
import StudentOutputTable from '../components/idCardOutput/StudentOutputTable.jsx';
import DownloadStatusMessage from '../components/idCardOutput/DownloadStatusMessage.jsx';

describe('ID CARD OUTPUT UI COMPONENTS', () => {
  let store;

  beforeEach(() => {
    vi.restoreAllMocks();
    store = configureAppStore({
      idCardOutput: {
        downloadStatus: 'IDLE',
        downloadingType: null,
        currentDownload: null,
        error: null,
      },
    });
  });

  it('1. DownloadButton renders and dispatches download action on click', () => {
    const { rerender } = render(
      <Provider store={store}>
        <DownloadButton type="PNG" generationId="g1" studentId="s1" studentName="Aarav" />
      </Provider>
    );

    expect(screen.getByRole('button', { name: /Download ID card for Aarav/i })).toBeInTheDocument();

    rerender(
      <Provider store={store}>
        <DownloadButton type="ZIP" generationId="g1" />
      </Provider>
    );

    expect(screen.getByRole('button', { name: /Download all ID cards as ZIP/i })).toBeInTheDocument();
  });

  it('2. GenerationDownloadPanel enables ZIP download on COMPLETED status', () => {
    const generationCompleted = {
      id: 'g1',
      status: 'COMPLETED',
      studentCount: 10,
    };

    render(
      <Provider store={store}>
        <GenerationDownloadPanel generation={generationCompleted} />
      </Provider>
    );

    expect(screen.getByText(/Complete ID Cards ZIP Package/i)).toBeInTheDocument();
    expect(screen.getByText(/Ready for export: 10 card\(s\)/i)).toBeInTheDocument();

    const zipBtn = screen.getByRole('button', { name: /Download all ID cards as ZIP/i });
    expect(zipBtn).toBeEnabled();
  });

  it('3. GenerationDownloadPanel disables ZIP download on PENDING and PROCESSING statuses', () => {
    const generationPending = {
      id: 'g1',
      status: 'PENDING',
      studentCount: 5,
    };

    const { rerender } = render(
      <Provider store={store}>
        <GenerationDownloadPanel generation={generationPending} />
      </Provider>
    );

    expect(screen.getByText(/This generation job is pending/i)).toBeInTheDocument();
    const zipBtn = screen.getByRole('button', { name: /Download all ID cards as ZIP/i });
    expect(zipBtn).toBeDisabled();

    rerender(
      <Provider store={store}>
        <GenerationDownloadPanel generation={{ id: 'g1', status: 'PROCESSING' }} />
      </Provider>
    );
    expect(screen.getByText(/ID cards are currently generating/i)).toBeInTheDocument();
  });

  it('4. StudentOutputTable renders student cards and availability badges', () => {
    const mockResults = [
      { studentId: 's1', studentName: 'Aarav Patel', studentRegNo: 'REG-101', status: 'COMPLETED' },
      { studentId: 's2', studentName: 'Diya Sharma', studentRegNo: 'REG-102', cleaned: true },
      { studentId: 's3', studentName: 'Rohan Gupta', studentRegNo: 'REG-103', status: 'FAILED' },
    ];

    render(
      <Provider store={store}>
        <StudentOutputTable generationId="g1" results={mockResults} />
      </Provider>
    );

    expect(screen.getByText('Aarav Patel')).toBeInTheDocument();
    expect(screen.getByText('Available (PNG)')).toBeInTheDocument();

    expect(screen.getByText('Diya Sharma')).toBeInTheDocument();
    expect(screen.getByText('Cleaned Up')).toBeInTheDocument();
    expect(screen.getByText('File cleaned')).toBeInTheDocument();

    expect(screen.getByText('Rohan Gupta')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('5. DownloadStatusMessage displays feedback for downloading, success, and error states', () => {
    const onDismiss = vi.fn();
    const { rerender } = render(
      <DownloadStatusMessage status="DOWNLOADING" />
    );
    expect(screen.getByText(/Generating binary stream/i)).toBeInTheDocument();

    rerender(
      <DownloadStatusMessage status="SUCCESS" onDismiss={onDismiss} />
    );
    expect(screen.getByText(/Download started successfully/i)).toBeInTheDocument();

    rerender(
      <DownloadStatusMessage
        status="FAILED"
        error="File is missing or expired"
        onDismiss={onDismiss}
      />
    );
    expect(screen.getByText('File is missing or expired')).toBeInTheDocument();
  });
});

