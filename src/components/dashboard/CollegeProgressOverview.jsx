import React from 'react';
import { Users, Shield, GraduationCap, CheckCircle2, AlertCircle, Sparkles, Clock } from 'lucide-react';
import DashboardStatCard from './DashboardStatCard.jsx';

export const CollegeProgressOverview = ({
  summary = {},
  isLoading = false,
}) => {
  const safeSummary = summary || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardStatCard
        title="Total Operators"
        value={safeSummary.totalOperators ?? 0}
        icon={Users}
        subtitle={`${safeSummary.activeOperators ?? 0} active in college`}
        colorScheme="indigo"
        isLoading={isLoading}
      />
      <DashboardStatCard
        title="Total Students"
        value={safeSummary.totalStudents ?? 0}
        icon={GraduationCap}
        subtitle="Enrolled student records"
        colorScheme="blue"
        isLoading={isLoading}
      />
      <DashboardStatCard
        title="Information Complete"
        value={safeSummary.completedStudents ?? 0}
        icon={CheckCircle2}
        subtitle="Ready for card generation"
        colorScheme="emerald"
        isLoading={isLoading}
      />
      <DashboardStatCard
        title="Information Pending"
        value={safeSummary.pendingStudents ?? 0}
        icon={AlertCircle}
        subtitle="Missing photos or details"
        colorScheme="amber"
        isLoading={isLoading}
      />
      <DashboardStatCard
        title="Generated ID Cards"
        value={safeSummary.generatedCards ?? 0}
        icon={Sparkles}
        subtitle="Successfully rendered"
        colorScheme="purple"
        isLoading={isLoading}
      />
      <DashboardStatCard
        title="Pending Generation"
        value={safeSummary.pendingCards ?? 0}
        icon={Clock}
        subtitle="Awaiting batch rendering"
        colorScheme="blue"
        isLoading={isLoading}
      />
      <DashboardStatCard
        title="Active Assignments"
        value={safeSummary.activeAssignments ?? safeSummary.totalAssignments ?? 0}
        icon={Shield}
        subtitle="Class sections assigned"
        colorScheme="emerald"
        isLoading={isLoading}
      />
      <DashboardStatCard
        title="Failed Jobs"
        value={safeSummary.failedCards ?? 0}
        icon={AlertCircle}
        subtitle="Requiring attention"
        colorScheme="rose"
        isLoading={isLoading}
      />
    </div>
  );
};

export default CollegeProgressOverview;

