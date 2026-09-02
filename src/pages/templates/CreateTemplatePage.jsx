import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CreditCard, ArrowLeft } from 'lucide-react';
import {
  createTemplateRequested,
  clearTemplateErrors,
} from '../../features/templates/templateSlice.js';
import {
  selectTemplateCreateLoading,
  selectTemplateError,
} from '../../features/templates/templateSelectors.js';
import { ROUTES, getTemplateDetailRoute } from '../../constants/routes.js';
import TemplateForm from '../../components/templates/TemplateForm.jsx';

export const CreateTemplatePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoading = useSelector(selectTemplateCreateLoading);
  const errorMessage = useSelector(selectTemplateError);

  useEffect(() => {
    dispatch(clearTemplateErrors());
  }, [dispatch]);

  const handleSubmit = (formData) => {
    dispatch(
      createTemplateRequested({
        data: formData,
        onSuccess: (created) => {
          if (created?.id) {
            navigate(getTemplateDetailRoute(created.id));
          } else {
            navigate(ROUTES.TEMPLATES);
          }
        },
      })
    );
  };

  const handleCancel = () => {
    navigate(ROUTES.TEMPLATES);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Navigation */}
      <div className="flex items-center gap-3">
        <Link
          to={ROUTES.TEMPLATES}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Templates</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <CreditCard className="w-7 h-7 text-indigo-600" />
          Create ID Card Template
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Design card layout, color branding, photo placement, and mapped dynamic student fields with live preview
        </p>
      </div>

      {/* Form Component */}
      <TemplateForm
        isEdit={false}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreateTemplatePage;
