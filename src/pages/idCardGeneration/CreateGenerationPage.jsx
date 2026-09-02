import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Sparkles, ArrowLeft } from 'lucide-react';
import {
  createGenerationRequested,
  createBulkGenerationRequested,
  clearGenerationErrors,
} from '../../features/idCardGeneration/idCardGenerationSlice.js';
import {
  selectGenerationCreateLoading,
  selectGenerationError,
} from '../../features/idCardGeneration/idCardGenerationSelectors.js';
import { fetchTemplatesRequested } from '../../features/templates/templateSlice.js';
import { selectTemplates } from '../../features/templates/templateSelectors.js';
import { fetchStudentsRequested } from '../../features/students/studentSlice.js';
import { selectStudents } from '../../features/students/studentSelectors.js';
import { ROUTES, getIdCardGenerationDetailRoute } from '../../constants/routes.js';
import GenerationCreateForm from '../../components/idCardGeneration/GenerationCreateForm.jsx';

export const CreateGenerationPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoading = useSelector(selectGenerationCreateLoading);
  const errorMessage = useSelector(selectGenerationError);
  const templates = useSelector(selectTemplates);
  const students = useSelector(selectStudents);

  useEffect(() => {
    dispatch(clearGenerationErrors());
    dispatch(fetchTemplatesRequested({ limit: 100 }));
    dispatch(fetchStudentsRequested({ limit: 100 }));
  }, [dispatch]);

  const handleSubmit = ({ isBulk, payload }) => {
    if (isBulk) {
      dispatch(
        createBulkGenerationRequested({
          data: payload,
          onSuccess: (created) => {
            if (created?.id) {
              navigate(getIdCardGenerationDetailRoute(created.id));
            } else {
              navigate(ROUTES.ID_CARD_GENERATIONS);
            }
          },
        })
      );
    } else {
      dispatch(
        createGenerationRequested({
          data: payload,
          onSuccess: (created) => {
            if (created?.id) {
              navigate(getIdCardGenerationDetailRoute(created.id));
            } else {
              navigate(ROUTES.ID_CARD_GENERATIONS);
            }
          },
        })
      );
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.ID_CARD_GENERATIONS);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Navigation */}
      <div className="flex items-center gap-3">
        <Link
          to={ROUTES.ID_CARD_GENERATIONS}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Generation Jobs</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-7 h-7 text-indigo-600" />
          Create ID Card Generation Job
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Generate high-resolution printable ID cards for single students or entire class batches
        </p>
      </div>

      {/* Form */}
      <GenerationCreateForm
        templates={templates}
        students={students}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreateGenerationPage;

