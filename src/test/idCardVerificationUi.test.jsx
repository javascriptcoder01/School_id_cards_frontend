import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import VerificationLoader from '../components/idCardVerification/VerificationLoader.jsx';
import VerificationStatus from '../components/idCardVerification/VerificationStatus.jsx';
import VerifiedStudentCard from '../components/idCardVerification/VerifiedStudentCard.jsx';
import { VERIFICATION_STATUS } from '../constants/idCardVerification.js';

describe('ID CARD VERIFICATION UI COMPONENTS', () => {
  it('1. VerificationLoader renders loading state', () => {
    render(<VerificationLoader message="Checking institution registry..." />);
    expect(screen.getByText('Digital ID Card Verification')).toBeInTheDocument();
    expect(screen.getByText('Checking institution registry...')).toBeInTheDocument();
  });

  it('2. VerificationStatus renders VERIFIED state', () => {
    render(<VerificationStatus status={VERIFICATION_STATUS.VERIFIED} />);
    expect(screen.getByText('ID Card Authenticity Verified')).toBeInTheDocument();
    expect(screen.getByText(/This student ID card credential has been verified/i)).toBeInTheDocument();
  });

  it('3. VerificationStatus renders FAILED state with generic message', () => {
    render(<VerificationStatus status={VERIFICATION_STATUS.FAILED} error="Custom fail message" />);
    expect(screen.getByText('Verification Failed')).toBeInTheDocument();
    expect(screen.getByText('Custom fail message')).toBeInTheDocument();
  });

  it('4. VerifiedStudentCard renders student and institution details properly', () => {
    const mockData = {
      verified: true,
      student: { studentId: 'STU-999', name: 'Aarav Patel' },
      college: { name: 'Stanford University' },
      generatedAt: '2026-08-31T18:45:00.000Z',
    };

    render(<VerifiedStudentCard verificationData={mockData} />);

    expect(screen.getByText('Aarav Patel')).toBeInTheDocument();
    expect(screen.getByText('STU-999')).toBeInTheDocument();
    expect(screen.getAllByText('Stanford University').length).toBeGreaterThan(0);
    expect(screen.getByText(/Active ID Record/i)).toBeInTheDocument();
  });
});

