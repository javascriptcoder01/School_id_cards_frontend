// printRequestDecline.js — Decline → Fix → Resubmit (backend constants/printRequest.js se match)

export const DECLINE_REASON_MIN = 5;
export const DECLINE_REASON_MAX = 500;
export const DECLINE_ITEM_NOTE_MAX = 200;
export const RESUBMIT_NOTE_MAX = 500;

// Flag kiye student ki galti (chip label + tone)
export const DECLINE_ISSUES = [
  { value: 'PHOTO_UNCLEAR', label: 'Photo unclear' },
  { value: 'PHOTO_MISSING', label: 'Photo missing' },
  { value: 'NAME_SPELLING', label: 'Name spelling' },
  { value: 'WRONG_CLASS', label: 'Wrong class' },
  { value: 'WRONG_DETAILS', label: 'Wrong details' },
  { value: 'OTHER', label: 'Other' },
];

export const DECLINE_ISSUE_LABELS = Object.fromEntries(DECLINE_ISSUES.map((i) => [i.value, i.label]));

/** @param {{ edited?: number, photosChanged?: number, removed?: number, added?: number }|null} summary */
export const totalChanges = (summary) =>
  (summary?.edited || 0) + (summary?.photosChanged || 0) + (summary?.removed || 0) + (summary?.added || 0);
