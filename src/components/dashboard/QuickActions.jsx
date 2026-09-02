import React from 'react';
import { Link } from 'react-router-dom';
import {
  School,
  UserPlus,
  Users,
  GraduationCap,
  FileSpreadsheet,
  CreditCard,
  Sparkles,
  QrCode,
  User,
  ArrowRight,
} from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';

export const QuickActions = ({ role }) => {
  const getActions = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return [
          {
            label: 'Register College',
            description: 'Onboard a new educational institution',
            path: ROUTES.COLLEGES_NEW,
            icon: School,
            color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
          },
          {
            label: 'Create User',
            description: 'Provision administrator credentials',
            path: ROUTES.USERS_NEW,
            icon: UserPlus,
            color: 'bg-purple-50 text-purple-600 border-purple-100',
          },
          {
            label: 'ID Card Templates',
            description: 'Inspect system-wide card layouts',
            path: ROUTES.TEMPLATES,
            icon: CreditCard,
            color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          },
        ];

      case 'COLLEGE_ADMIN':
        return [
          {
            label: 'Add Student',
            description: 'Enroll a single student record',
            path: ROUTES.STUDENTS_NEW,
            icon: GraduationCap,
            color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
          },
          {
            label: 'Bulk Import',
            description: 'Upload batch CSV/Excel student roster',
            path: ROUTES.STUDENT_IMPORT,
            icon: FileSpreadsheet,
            color: 'bg-blue-50 text-blue-600 border-blue-100',
          },
          {
            label: 'New Template',
            description: 'Configure layout specifications',
            path: ROUTES.TEMPLATES_NEW,
            icon: CreditCard,
            color: 'bg-purple-50 text-purple-600 border-purple-100',
          },
          {
            label: 'Generate Cards',
            description: 'Dispatch new ID card rendering job',
            path: ROUTES.ID_CARD_GENERATION_NEW,
            icon: Sparkles,
            color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          },
        ];

      default:
        return [
          {
            label: 'Verify ID Card',
            description: 'Verify student credentials with QR code',
            path: ROUTES.PUBLIC_VERIFY_FORM,
            icon: QrCode,
            color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
          },
          {
            label: 'My Account',
            description: 'Manage profile and security settings',
            path: ROUTES.ACCOUNT,
            icon: User,
            color: 'bg-slate-50 text-slate-600 border-slate-200',
          },
        ];
    }
  };

  const actions = getActions();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, idx) => {
        const Icon = action.icon;
        return (
          <Link
            key={idx}
            to={action.path}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all group flex flex-col justify-between"
          >
            <div>
              <div
                className={`w-10 h-10 rounded-2xl ${action.color} border flex items-center justify-center font-bold mb-3 shadow-xs`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {action.label}
              </h4>
              <p className="text-xs text-slate-500 mt-1">{action.description}</p>
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 mt-4 group-hover:translate-x-0.5 transition-transform">
              <span>Launch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default QuickActions;
