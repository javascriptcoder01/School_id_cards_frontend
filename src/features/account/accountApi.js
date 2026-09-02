import { getUserData } from '../../utils/storage.js';

/**
 * Account API Service
 * Interacts with verified authentication context to provide safe user profile details
 */

export const getCurrentAccount = async () => {
  const user = getUserData();
  if (!user || !user.id) {
    throw new Error('User session not found');
  }

  // Whitelist display-safe fields
  return {
    id: user.id,
    name: user.name || 'User',
    email: user.email || 'N/A',
    role: user.role || 'USER',
    collegeId: user.collegeId || null,
    isActive: user.isActive !== false,
  };
};

export default {
  getCurrentAccount,
};

