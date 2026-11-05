// import { getUserData } from '../../utils/storage.js';


// export const getCurrentAccount = async () => {
//   const user = getUserData();
//   if (!user || !user.id) {
//     throw new Error('User session not found');
//   }

//   // Whitelist display-safe fields
//   return {
//     id: user.id,
//     name: user.name || 'User',
//     email: user.email || 'N/A',
//     role: user.role || 'USER',
//     collegeId: user.collegeId || null,
//     isActive: user.isActive !== false,
//   };
// };

// export default {
//   getCurrentAccount,
// };


import { getUserData } from '../../utils/storage.js';

// collegeId populate hokar object bhi aa sakta hai → id + naam dono nikal lo
const readCollege = (user) => {
  const populated = user.collegeId && typeof user.collegeId === 'object' ? user.collegeId : null;
  const college = user.college && typeof user.college === 'object' ? user.college : null;

  return {
    collegeId: (populated ? populated._id || populated.id : user.collegeId) || college?.id || college?._id || null,
    collegeName: college?.name || populated?.name || user.collegeName || null,
    collegeCode: college?.code || populated?.code || user.collegeCode || null,
  };
};

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
    ...readCollege(user),
    isActive: user.isActive !== false,
  };
};

export default {
  getCurrentAccount,
};
