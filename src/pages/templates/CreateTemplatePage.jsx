import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CreditCard, ArrowLeft, ShieldAlert } from 'lucide-react';
import {
  createTemplateRequested,
  clearTemplateErrors,
} from '../../features/templates/templateSlice.js';
import {
  selectTemplateCreateLoading,
  selectTemplateError,
} from '../../features/templates/templateSelectors.js';
import { selectUserRole } from '../../features/auth/authSelectors.js';
import { ROUTES, getTemplateDetailRoute } from '../../constants/routes.js';
import TemplateForm from '../../components/templates/TemplateForm.jsx';

export const CreateTemplatePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userRole = useSelector(selectUserRole);
  const isLoading = useSelector(selectTemplateCreateLoading);
  const errorMessage = useSelector(selectTemplateError);

  // Backend sirf COLLEGE_ADMIN ko template banane deta hai (collegeId usi user se aata hai)
  const canCreate = userRole === 'COLLEGE_ADMIN';

  useEffect(() => {
    dispatch(clearTemplateErrors());
    return () => {
      dispatch(clearTemplateErrors());
    };
  }, [dispatch]);

  const handleSubmit = (formData) => {
    dispatch(
      createTemplateRequested({
        data: formData,
        onSuccess: (created) => {
          // Response mein `template` wrapper ya seedha object, aur `_id` ya `id` ho sakta hai
          const template = created?.template || created;
          const id = template?._id || template?.id;
          navigate(id ? getTemplateDetailRoute(id) : ROUTES.TEMPLATES);
        },
      })
    );
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <Link
        to={ROUTES.TEMPLATES}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Templates</span>
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <CreditCard className="w-7 h-7 text-indigo-600" />
          Create ID Card Template
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Choose a letterhead, place the student photo, fields, QR code, logo, signature and stamp, then preview the card
        </p>
      </div>

      {canCreate ? (
        <TemplateForm
          isEdit={false}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onSubmit={handleSubmit}
          onCancel={() => navigate(ROUTES.TEMPLATES)}
        />
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-amber-50 text-amber-600 grid place-items-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">Only college admins can create templates</h2>
          <p className="mt-1 text-sm text-slate-500">
            Templates belong to a college. Sign in as that college&apos;s admin to create one.
          </p>
        </div>
      )}
    </div>
  );
};

export default CreateTemplatePage;