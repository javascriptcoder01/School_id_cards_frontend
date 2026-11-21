// documents.js — Document composer: doc types (backend DOC_TYPES) + quick body templates (code mein, segment-wise).
// Placeholders {{key}} chhote form se bharte hain (HTML-escape karke).

export const DOC_TYPES = Object.freeze([
  { value: 'LETTER', label: 'Letter' },
  { value: 'CERTIFICATE', label: 'Certificate' },
  { value: 'NOTICE', label: 'Notice' },
  { value: 'CIRCULAR', label: 'Circular' },
  { value: 'OFFER_LETTER', label: 'Offer letter' },
  { value: 'INVOICE_NOTE', label: 'Invoice note' },
  { value: 'OTHER', label: 'Other' },
]);
export const DOC_TYPE_LABEL = Object.fromEntries(DOC_TYPES.map((t) => [t.value, t.label]));

export const BODY_MAX_BYTES = 200 * 1024;
export const LIST_MAX_ITEMS = 20;

const ALL = ['ACADEMIC', 'CORPORATE', 'LEGAL', 'MEDICAL', 'GOVERNMENT', 'NGO', 'GENERAL'];

export const QUICK_TEMPLATES = Object.freeze([
  {
    id: 'bonafide',
    name: 'Bonafide certificate',
    segments: ['ACADEMIC'],
    docType: 'CERTIFICATE',
    subject: 'Bonafide Certificate',
    fields: [
      { key: 'studentName', label: 'Student name' },
      { key: 'parentName', label: "Father's / Mother's name" },
      { key: 'className', label: 'Class / course' },
      { key: 'session', label: 'Session', placeholder: '2026-27' },
      { key: 'admissionNo', label: 'Admission no.' },
      { key: 'purpose', label: 'Purpose', placeholder: 'bank account opening' },
    ],
    body: `<h2 style="text-align: center">BONAFIDE CERTIFICATE</h2>
<p>This is to certify that <strong>{{studentName}}</strong>, son / daughter of {{parentName}}, is a bonafide student of this institution, studying in <strong>{{className}}</strong> during the academic session {{session}}. Admission number: {{admissionNo}}.</p>
<p>This certificate is issued on request for the purpose of {{purpose}}.</p>`,
  },
  {
    id: 'character',
    name: 'Character certificate',
    segments: ['ACADEMIC', 'GOVERNMENT', 'NGO'],
    docType: 'CERTIFICATE',
    subject: 'Character Certificate',
    fields: [
      { key: 'personName', label: 'Name' },
      { key: 'parentName', label: "Father's / Mother's name" },
      { key: 'period', label: 'Period', placeholder: '2022 to 2026' },
      { key: 'className', label: 'Class / role' },
    ],
    body: `<h2 style="text-align: center">CHARACTER CERTIFICATE</h2>
<p>This is to certify that <strong>{{personName}}</strong>, son / daughter of {{parentName}}, was associated with this institution as {{className}} from {{period}}.</p>
<p>To the best of our knowledge, their conduct and character during this period were <strong>good</strong>. We wish them success in all future endeavours.</p>`,
  },
  {
    id: 'leave',
    name: 'Leave sanction',
    segments: ALL,
    docType: 'LETTER',
    subject: 'Sanction of Leave',
    fields: [
      { key: 'employeeName', label: 'Employee name' },
      { key: 'fromDate', label: 'From date' },
      { key: 'toDate', label: 'To date' },
      { key: 'days', label: 'Number of days' },
      { key: 'leaveType', label: 'Leave type', placeholder: 'casual leave' },
    ],
    body: `<p>Dear {{employeeName}},</p>
<p>With reference to your application, you are granted <strong>{{leaveType}}</strong> for {{days}} day(s), from <strong>{{fromDate}}</strong> to <strong>{{toDate}}</strong>.</p>
<p>Please report back on duty on the next working day after the leave ends.</p>`,
  },
  {
    id: 'experience',
    name: 'Experience letter',
    segments: ['ACADEMIC', 'CORPORATE', 'MEDICAL', 'NGO', 'GENERAL', 'LEGAL'],
    docType: 'CERTIFICATE',
    subject: 'Experience Certificate',
    fields: [
      { key: 'employeeName', label: 'Employee name' },
      { key: 'designation', label: 'Designation' },
      { key: 'joiningDate', label: 'Joining date' },
      { key: 'relievingDate', label: 'Relieving date' },
    ],
    body: `<h2 style="text-align: center">TO WHOM IT MAY CONCERN</h2>
<p>This is to certify that <strong>{{employeeName}}</strong> worked with us as <strong>{{designation}}</strong> from {{joiningDate}} to {{relievingDate}}.</p>
<p>During this period we found them sincere, hardworking and dependable. We wish them every success in their career.</p>`,
  },
  {
    id: 'offer',
    name: 'Offer letter',
    segments: ['CORPORATE', 'ACADEMIC', 'MEDICAL', 'NGO', 'GENERAL'],
    docType: 'OFFER_LETTER',
    subject: 'Offer of Employment',
    fields: [
      { key: 'candidateName', label: 'Candidate name' },
      { key: 'designation', label: 'Designation' },
      { key: 'ctc', label: 'Salary / CTC', placeholder: '₹ 4,80,000 per annum' },
      { key: 'joiningDate', label: 'Joining date' },
      { key: 'location', label: 'Work location' },
      { key: 'acceptBy', label: 'Accept by (date)' },
    ],
    body: `<p>Dear {{candidateName}},</p>
<p>We are pleased to offer you the position of <strong>{{designation}}</strong> at {{location}}, with a total compensation of <strong>{{ctc}}</strong>.</p>
<p>Your expected date of joining is <strong>{{joiningDate}}</strong>. Detailed terms will be shared in your appointment letter.</p>
<p>Please sign and return a copy of this letter as your acceptance by {{acceptBy}}.</p>
<p>We look forward to welcoming you.</p>`,
  },
  {
    id: 'notice',
    name: 'Notice / Circular',
    segments: ALL,
    docType: 'NOTICE',
    subject: 'Notice',
    fields: [
      { key: 'title', label: 'Title', placeholder: 'Holiday on account of Diwali' },
      { key: 'audience', label: 'For', placeholder: 'all students and staff' },
      { key: 'details', label: 'Details' },
    ],
    body: `<h2 style="text-align: center">NOTICE</h2>
<h3 style="text-align: center">{{title}}</h3>
<p>This is to inform {{audience}} that {{details}}</p>
<p>All concerned are requested to take note.</p>`,
  },
  {
    id: 'fee-reminder',
    name: 'Fee reminder',
    segments: ['ACADEMIC'],
    docType: 'LETTER',
    subject: 'Reminder: Pending Fee Payment',
    fields: [
      { key: 'parentName', label: 'Parent name' },
      { key: 'studentName', label: 'Student name' },
      { key: 'className', label: 'Class' },
      { key: 'amount', label: 'Amount due', placeholder: '₹ 12,500' },
      { key: 'dueDate', label: 'Pay by (date)' },
    ],
    body: `<p>Dear {{parentName}},</p>
<p>This is a gentle reminder that a fee amount of <strong>{{amount}}</strong> for your ward <strong>{{studentName}}</strong> ({{className}}) is pending.</p>
<p>Kindly pay the amount by <strong>{{dueDate}}</strong> to avoid a late fee. Please ignore this letter if the payment has already been made.</p>`,
  },
  {
    id: 'appointment',
    name: 'Appointment letter',
    segments: ['ACADEMIC', 'CORPORATE', 'MEDICAL', 'GOVERNMENT', 'NGO', 'GENERAL'],
    docType: 'LETTER',
    subject: 'Letter of Appointment',
    fields: [
      { key: 'employeeName', label: 'Employee name' },
      { key: 'designation', label: 'Designation' },
      { key: 'joiningDate', label: 'Joining date' },
      { key: 'salary', label: 'Salary', placeholder: '₹ 40,000 per month' },
      { key: 'probation', label: 'Probation period', placeholder: '6 months' },
    ],
    body: `<p>Dear {{employeeName}},</p>
<p>We are pleased to appoint you as <strong>{{designation}}</strong> with effect from <strong>{{joiningDate}}</strong>, on the following terms:</p>
<ol><li>Salary: {{salary}}.</li><li>Probation: {{probation}}, after which your service may be confirmed.</li><li>You will follow the rules and policies of the organisation in force from time to time.</li></ol>
<p>Please sign a copy of this letter as your acceptance.</p>`,
  },
  {
    id: 'legal-notice',
    name: 'Legal notice (format)',
    segments: ['LEGAL'],
    docType: 'NOTICE',
    subject: 'Legal Notice',
    fields: [
      { key: 'clientName', label: 'On behalf of (client)' },
      { key: 'addresseeName', label: 'Addressed to' },
      { key: 'facts', label: 'Facts (short)' },
      { key: 'demand', label: 'Demand' },
      { key: 'days', label: 'Days to comply', placeholder: '15' },
    ],
    body: `<h2 style="text-align: center">LEGAL NOTICE</h2>
<p>Under instructions from and on behalf of my client, <strong>{{clientName}}</strong>, I hereby serve you, <strong>{{addresseeName}}</strong>, with the following legal notice:</p>
<ol><li>That {{facts}}</li><li>That despite repeated requests, you have failed to resolve the matter.</li></ol>
<p>You are hereby called upon to {{demand}} within <strong>{{days}} days</strong> of receiving this notice, failing which my client will be constrained to initiate appropriate legal proceedings against you at your risk as to costs and consequences.</p>
<p><em>This is a format only. Please review it with a qualified advocate before use.</em></p>`,
  },
  {
    id: 'medical-certificate',
    name: 'Medical certificate (format)',
    segments: ['MEDICAL'],
    docType: 'CERTIFICATE',
    subject: 'Medical Certificate',
    fields: [
      { key: 'patientName', label: 'Patient name' },
      { key: 'age', label: 'Age' },
      { key: 'diagnosis', label: 'Condition' },
      { key: 'fromDate', label: 'Rest from' },
      { key: 'toDate', label: 'Rest to' },
    ],
    body: `<h2 style="text-align: center">MEDICAL CERTIFICATE</h2>
<p>This is to certify that <strong>{{patientName}}</strong>, aged {{age}} years, was examined by me and is suffering from <strong>{{diagnosis}}</strong>.</p>
<p>They are advised rest from <strong>{{fromDate}}</strong> to <strong>{{toDate}}</strong> and may resume normal duties thereafter.</p>
<p><em>This is a format only. Issue it only after a clinical examination.</em></p>`,
  },
]);

export const quickTemplatesFor = (segment) => QUICK_TEMPLATES.filter((t) => !segment || t.segments.includes(segment));

const escapeHtml = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** {{key}} → escaped value; khaali chhoda to "________" (baad mein editor mein bhar sakte hain) */
export const fillTemplate = (body, values = {}) =>
  String(body).replace(/\{\{(\w+)\}\}/g, (_, key) => (String(values[key] ?? '').trim() ? escapeHtml(values[key].trim()) : '________'));

export const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
