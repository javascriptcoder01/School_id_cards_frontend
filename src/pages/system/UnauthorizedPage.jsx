import React from 'react';
import UnauthorizedState from '../../components/common/UnauthorizedState.jsx';

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12">
      <UnauthorizedState />
    </div>
  );
};

export default UnauthorizedPage;

