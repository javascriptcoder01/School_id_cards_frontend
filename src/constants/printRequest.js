/**
 * Print Request Constants and Metadata
 */

export const PRINT_REQUEST_TYPES = Object.freeze({
  SINGLE: 'SINGLE',
  BULK: 'BULK',
});

export const PRINT_REQUEST_STATUS = Object.freeze({
  PENDING_COLLEGE_APPROVAL: 'PENDING_COLLEGE_APPROVAL',
  COLLEGE_APPROVED: 'COLLEGE_APPROVED',
  COLLEGE_REJECTED: 'COLLEGE_REJECTED',
  SENT_TO_SUPER_ADMIN: 'SENT_TO_SUPER_ADMIN',
  SUPER_ADMIN_APPROVED: 'SUPER_ADMIN_APPROVED',
  SUPER_ADMIN_REJECTED: 'SUPER_ADMIN_REJECTED',
  PRINTING: 'PRINTING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
});

export const PRINT_REQUEST_STATUS_META = Object.freeze({
  [PRINT_REQUEST_STATUS.PENDING_COLLEGE_APPROVAL]: {
    label: 'Pending College Approval',
    badgeVariant: 'warning',
    colorClass: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Submitted by operator, waiting for college admin review.',
    stepIndex: 1,
    isTerminal: false,
    allowedActions: {
      COLLEGE_ADMIN: ['APPROVE', 'REJECT'],
      OPERATOR: [],
      SUPER_ADMIN: [],
    },
  },
  [PRINT_REQUEST_STATUS.COLLEGE_APPROVED]: {
    label: 'College Approved',
    badgeVariant: 'info',
    colorClass: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Approved by college admin, ready to forward to Super Admin.',
    stepIndex: 2,
    isTerminal: false,
    allowedActions: {
      COLLEGE_ADMIN: ['SEND_TO_SUPER_ADMIN'],
      OPERATOR: [],
      SUPER_ADMIN: [],
    },
  },
  [PRINT_REQUEST_STATUS.COLLEGE_REJECTED]: {
    label: 'College Rejected',
    badgeVariant: 'danger',
    colorClass: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Rejected by college admin.',
    stepIndex: 2,
    isTerminal: true,
    allowedActions: {
      COLLEGE_ADMIN: [],
      OPERATOR: [],
      SUPER_ADMIN: [],
    },
  },
  [PRINT_REQUEST_STATUS.SENT_TO_SUPER_ADMIN]: {
    label: 'Sent to Super Admin',
    badgeVariant: 'primary',
    colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Forwarded to Super Admin central print queue.',
    stepIndex: 3,
    isTerminal: false,
    allowedActions: {
      COLLEGE_ADMIN: [],
      OPERATOR: [],
      SUPER_ADMIN: ['APPROVE', 'REJECT'],
    },
  },
  [PRINT_REQUEST_STATUS.SUPER_ADMIN_APPROVED]: {
    label: 'Super Admin Approved',
    badgeVariant: 'info',
    colorClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    description: 'Approved by Super Admin, ready for printing.',
    stepIndex: 4,
    isTerminal: false,
    allowedActions: {
      COLLEGE_ADMIN: [],
      OPERATOR: [],
      SUPER_ADMIN: ['MARK_PRINTING'],
    },
  },
  [PRINT_REQUEST_STATUS.SUPER_ADMIN_REJECTED]: {
    label: 'Super Admin Rejected',
    badgeVariant: 'danger',
    colorClass: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Rejected by Super Admin.',
    stepIndex: 4,
    isTerminal: true,
    allowedActions: {
      COLLEGE_ADMIN: [],
      OPERATOR: [],
      SUPER_ADMIN: [],
    },
  },
  [PRINT_REQUEST_STATUS.PRINTING]: {
    label: 'Printing in Progress',
    badgeVariant: 'warning',
    colorClass: 'bg-amber-50 text-amber-700 border-amber-300',
    description: 'ID cards are actively being printed.',
    stepIndex: 5,
    isTerminal: false,
    allowedActions: {
      COLLEGE_ADMIN: [],
      OPERATOR: [],
      SUPER_ADMIN: ['DOWNLOAD_ZIP', 'MARK_COMPLETED'],
    },
  },
  [PRINT_REQUEST_STATUS.COMPLETED]: {
    label: 'Print Completed',
    badgeVariant: 'success',
    colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'ID cards have been printed and completed.',
    stepIndex: 6,
    isTerminal: true,
    allowedActions: {
      COLLEGE_ADMIN: [],
      OPERATOR: [],
      SUPER_ADMIN: [],
    },
  },
  [PRINT_REQUEST_STATUS.CANCELLED]: {
    label: 'Cancelled',
    badgeVariant: 'default',
    colorClass: 'bg-slate-50 text-slate-700 border-slate-200',
    description: 'Print request was cancelled.',
    stepIndex: 0,
    isTerminal: true,
    allowedActions: {
      COLLEGE_ADMIN: [],
      OPERATOR: [],
      SUPER_ADMIN: [],
    },
  },
});

export default {
  PRINT_REQUEST_TYPES,
  PRINT_REQUEST_STATUS,
  PRINT_REQUEST_STATUS_META,
};

