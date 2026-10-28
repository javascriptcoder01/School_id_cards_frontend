// requestActionConfig.js — har status action ka button + confirm modal text.
// KAUN sa action dikhe ye backend (`availableActions`) batata hai; yahan sirf UI text / style hai.

export const REQUEST_ACTION_CONFIG = {
  SUBMIT: {
    label: 'Send for Approval',
    tone: 'primary',
    reasonMode: 'none',
    title: 'Send for approval?',
    message: 'The school admin will review this request. You cannot edit it while it is pending.',
    confirmLabel: 'Send for Approval',
  },
  CANCEL: {
    label: 'Cancel Request',
    tone: 'danger',
    reasonMode: 'optional',
    title: 'Cancel this request?',
    message: 'The request will be closed and its students become available for a new request.',
    confirmLabel: 'Cancel Request',
  },
  APPROVE: {
    label: 'Approve',
    tone: 'primary',
    reasonMode: 'none',
    title: 'Approve this request?',
    message: 'Cards will be locked with the current photos and template, and sent to the Print Center.',
    confirmLabel: 'Approve & Lock Cards',
  },
  REJECT: {
    label: 'Reject',
    tone: 'danger',
    reasonMode: 'required',
    title: 'Reject this request?',
    message: 'The class teacher will see your reason and can fix and resend the request.',
    confirmLabel: 'Reject Request',
    reasonLabel: 'Reason for rejection',
  },
  ACCEPT: {
    label: 'Accept for Printing',
    tone: 'primary',
    reasonMode: 'none',
    title: 'Accept this request?',
    message: 'The request moves to printing and the print files become available to download.',
    confirmLabel: 'Accept',
  },
  DECLINE: {
    label: 'Decline',
    tone: 'danger',
    reasonMode: 'required',
    title: 'Decline this request?',
    message: 'The school will see your reason. The locked cards are revoked and will not be printed.',
    confirmLabel: 'Decline Request',
    reasonLabel: 'Reason for declining',
  },
  COMPLETE: {
    label: 'Mark Printing Done',
    tone: 'primary',
    reasonMode: 'none',
    title: 'Mark printing as done?',
    message: 'All roles will see this request as Completed.',
    confirmLabel: 'Mark as Completed',
  },
};

// Buttons isi order mein dikhte hain (primary pehle, danger baad mein)
export const REQUEST_ACTION_ORDER = ['SUBMIT', 'APPROVE', 'ACCEPT', 'COMPLETE', 'REJECT', 'DECLINE', 'CANCEL'];

export const sortActions = (actions = []) =>
  REQUEST_ACTION_ORDER.filter((action) => actions.includes(action));
