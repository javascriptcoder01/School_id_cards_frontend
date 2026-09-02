import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CreditCard, ArrowLeft } from 'lucide-react';
import {
  fetchTemplateDetailRequested,
  updateTemplateRequested,
  clearTemplateErrors,
} from '../../features/templates/templateSlice.js';
import {
  selectSelectedTemplate,
  selectTemplateDetailLoading,
  selectTemplateUpdateLoading,
  selectTemplateError,
} from '../../features/templates/templateSelectors.js';
import { ROUTES, getTemplateDetailRoute } from '../../constants/routes.js';
import TemplateForm from '../../components/templates/TemplateForm.jsx';
import Loader from '../../components/common/Loader.jsx';

export const EditTemplatePage = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const template = useSelector(selectSelectedTemplate);
  const isFetching = useSelector(selectTemplateDetailLoading);
  const isUpdating = useSelector(selectTemplateUpdateLoading);
  const errorMessage = useSelector(selectTemplateError);

  useEffect(() => {
    dispatch(clearTemplateErrors());
    if (templateId && (!template || template.id !== templateId)) {
      dispatch(fetchTemplateDetailRequested(templateId));
    }
  }, [dispatch, templateId, template]);

  const handleSubmit = (formData) => {
    dispatch(
      updateTemplateRequested({
        id: templateId,
        data: formData,
        onSuccess: () => {
          navigate(getTemplateDetailRoute(templateId));
        },
      })
    );
  };

  const handleCancel = () => {
    navigate(getTemplateDetailRoute(templateId));
  };

  if (isFetching && !template) {
    return <Loader message="Fetching template configuration..." />;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Navigation */}
      <div className="flex items-center gap-3">
        <Link
          to={getTemplateDetailRoute(templateId)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Template Details</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <CreditCard className="w-7 h-7 text-indigo-600" />
          Edit ID Card Template
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Update card dimensions, branding theme colors, or mapped dynamic text positions with live preview
        </p>
      </div>

      {/* Form Component */}
      <TemplateForm
        initialValues={template}
        isEdit={true}
        isLoading={isUpdating}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default EditTemplatePage;
