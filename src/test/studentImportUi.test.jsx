import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BulkImportUploader from '../components/studentImport/BulkImportUploader.jsx';
import ImportProgress from '../components/studentImport/ImportProgress.jsx';
import ImportSummary from '../components/studentImport/ImportSummary.jsx';
import ImportErrorsTable from '../components/studentImport/ImportErrorsTable.jsx';

describe('STUDENT BULK IMPORT UI COMPONENTS', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. BulkImportUploader renders drag and drop area and browse option', () => {
    render(
      <BulkImportUploader
        onUpload={vi.fn()}
        onFileChange={vi.fn()}
        onFileRemove={vi.fn()}
      />
    );

    expect(screen.getByText(/Drag and drop your spreadsheet here/i)).toBeInTheDocument();
    expect(screen.getByText(/Supported formats: CSV \(\.csv\) and Excel \(\.xlsx\)/i)).toBeInTheDocument();
  });

  it('2. BulkImportUploader rejects invalid file extensions (.pdf, .exe)', () => {
    const onFileChange = vi.fn();
    const { container } = render(
      <BulkImportUploader
        onUpload={vi.fn()}
        onFileChange={onFileChange}
        onFileRemove={vi.fn()}
      />
    );

    const input = container.querySelector('#student-file-input');
    const invalidFile = new File(['%PDF-1.4'], 'document.pdf', { type: 'application/pdf' });

    fireEvent.change(input, { target: { files: [invalidFile] } });

    expect(
      screen.getByText(/Invalid file format. Only .csv and .xlsx files are supported/i)
    ).toBeInTheDocument();
    expect(onFileChange).not.toHaveBeenCalled();
  });

  it('3. BulkImportUploader rejects files exceeding 10 MB limit', () => {
    const onFileChange = vi.fn();
    const { container } = render(
      <BulkImportUploader
        onUpload={vi.fn()}
        onFileChange={onFileChange}
        onFileRemove={vi.fn()}
      />
    );

    const input = container.querySelector('#student-file-input');
    // 11 MB file
    const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large_data.csv', {
      type: 'text/csv',
    });

    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(
      screen.getByText(/File size exceeds the 10 MB maximum limit/i)
    ).toBeInTheDocument();
    expect(onFileChange).not.toHaveBeenCalled();
  });

  it('4. BulkImportUploader accepts valid .csv file and enables Start Import', () => {
    const onUpload = vi.fn();
    const validFile = new File(['studentId,name\n1,Aarav'], 'valid_students.csv', {
      type: 'text/csv',
    });

    render(
      <BulkImportUploader
        selectedFile={validFile}
        onUpload={onUpload}
        onFileChange={vi.fn()}
        onFileRemove={vi.fn()}
      />
    );

    expect(screen.getByText('valid_students.csv')).toBeInTheDocument();
    const startBtn = screen.getByRole('button', { name: /Start Import/i });
    expect(startBtn).toBeEnabled();

    fireEvent.click(startBtn);
    expect(onUpload).toHaveBeenCalledWith(validFile);
  });

  it('5. ImportProgress displays progress for UPLOADING and COMPLETED states', () => {
    const { rerender } = render(<ImportProgress status="UPLOADING" />);
    expect(screen.getByText(/Uploading and Processing Student Records/i)).toBeInTheDocument();

    rerender(<ImportProgress status="COMPLETED" />);
    expect(screen.getByText(/Import Batch Finished/i)).toBeInTheDocument();

    rerender(<ImportProgress status="FAILED" errorMessage="Server failed to parse Excel" />);
    expect(screen.getByText('Server failed to parse Excel')).toBeInTheDocument();
  });

  it('6. ImportSummary displays counts correctly', () => {
    render(
      <ImportSummary
        result={{
          totalRecords: 100,
          successCount: 95,
          failedCount: 5,
        }}
      />
    );

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('95')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('7. ImportErrorsTable renders row, field, and error message for failed records', () => {
    const errors = [
      { row: 4, field: 'email', message: 'Invalid email address format' },
      { row: 12, field: 'studentId', message: 'Student ID already exists in this college' },
    ];

    render(<ImportErrorsTable errors={errors} />);

    expect(screen.getByText('Import Errors (2)')).toBeInTheDocument();
    expect(screen.getByText('Row 4')).toBeInTheDocument();
    expect(screen.getByText('email')).toBeInTheDocument();
    expect(screen.getByText('Invalid email address format')).toBeInTheDocument();

    expect(screen.getByText('Row 12')).toBeInTheDocument();
    expect(screen.getByText('studentId')).toBeInTheDocument();
    expect(screen.getByText('Student ID already exists in this college')).toBeInTheDocument();
  });
});

