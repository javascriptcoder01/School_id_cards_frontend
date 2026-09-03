/**
 * Student Profile Completion Utility
 *
 * Implements deterministic 5-field student completeness calculation:
 * - name (non-empty string)
 * - studentId (non-empty string)
 * - className (non-empty string)
 * - section / sectionName (non-empty string)
 * - photo (non-empty string URL)
 *
 * Output schema:
 * {
 *   isComplete: boolean,
 *   completedFields: string[],
 *   completedCount: number,
 *   totalRequired: number,
 *   percentage: number,
 *   missingFields: string[]
 * }
 */

export const calculateStudentCompletion = (student) => {
  if (!student || typeof student !== 'object') {
    return {
      isComplete: false,
      completedFields: [],
      completedCount: 0,
      totalRequired: 5,
      percentage: 0,
      missingFields: ['name', 'studentId', 'className', 'section', 'photo'],
    };
  }

  const fields = [
    {
      key: 'name',
      label: 'Name',
      valid: typeof student.name === 'string' && student.name.trim().length > 0,
    },
    {
      key: 'studentId',
      label: 'Student ID',
      valid: typeof student.studentId === 'string' && student.studentId.trim().length > 0,
    },
    {
      key: 'className',
      label: 'Class',
      valid:
        (typeof student.className === 'string' && student.className.trim().length > 0) ||
        (typeof student.class === 'string' && student.class.trim().length > 0),
    },
    {
      key: 'section',
      label: 'Section',
      valid:
        (typeof student.section === 'string' && student.section.trim().length > 0) ||
        (typeof student.sectionName === 'string' && student.sectionName.trim().length > 0),
    },
    {
      key: 'photo',
      label: 'Photo',
      valid:
        (typeof student.photo === 'string' && student.photo.trim().length > 0) ||
        (typeof student.photoUrl === 'string' && student.photoUrl.trim().length > 0),
    },
  ];

  const completedFields = fields.filter((f) => f.valid).map((f) => f.key);
  const completedCount = completedFields.length;
  const missingFields = fields.filter((f) => !f.valid).map((f) => f.key);
  const totalRequired = fields.length;
  const percentage = Math.round((completedCount / totalRequired) * 100);
  const isComplete = completedCount === totalRequired;

  return {
    isComplete,
    completedFields,
    completedCount,
    totalRequired,
    percentage,
    missingFields,
  };
};

// Backward-compatible alias
export const computeStudentCompletion = calculateStudentCompletion;

export default calculateStudentCompletion;
