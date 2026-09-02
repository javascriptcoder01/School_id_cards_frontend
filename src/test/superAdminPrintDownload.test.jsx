import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PrintDownloadActions from '../components/superAdmin/PrintDownloadActions.jsx';
import { triggerBrowserDownload } from '../features/superAdminPrint/superAdminPrintSaga.js';

describe('SUPER ADMIN BINARY DOWNLOADS', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. triggerBrowserDownload creates temporary anchor and revokes object URL', () => {
    const createObjectURLMock = vi.fn().mockReturnValue('blob:http://localhost/fake-url');
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    triggerBrowserDownload(new Blob(['hello']), 'application/pdf', 'test.pdf');

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:http://localhost/fake-url');
  });

  it('2. PrintDownloadActions fires callbacks on ZIP and PDF button clicks', () => {
    const handleZip = vi.fn();
    const handlePdf = vi.fn();

    render(
      <PrintDownloadActions
        onDownloadZip={handleZip}
        onDownloadPdf={handlePdf}
        isDownloading={false}
      />
    );

    fireEvent.click(screen.getByText('Download College ZIP'));
    expect(handleZip).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Export Print-Ready PDF'));
    expect(handlePdf).toHaveBeenCalled();
  });
});

