import React from 'react';
import { School, Sparkles, Printer, Clock, AlertCircle } from 'lucide-react';
import DashboardStatCard from '../dashboard/DashboardStatCard.jsx';

export const SuperAdminPrintSummary = ({
  colleges = [],
  isLoading = false,
}) => {
  // Aggregate statistics across all colleges
  const totals = colleges.reduce(
    (acc, item) => {
      const stats = item.statistics || {};
      acc.totalStudents += stats.totalStudents || 0;
      acc.completedStudents += stats.completedStudents || 0;
      acc.generatedCards += stats.generatedCards || 0;
      acc.readyToPrint += stats.readyToPrint !== undefined ? stats.readyToPrint : (stats.generatedCards || 0);
      acc.pendingCards += stats.pendingCards || 0;
      acc.failedCards += stats.failedCards || 0;
      return acc;
    },
    {
      totalStudents: 0,
      completedStudents: 0,
      generatedCards: 0,
      readyToPrint: 0,
      pendingCards: 0,
      failedCards: 0,
    }
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <DashboardStatCard
        title="Total Colleges"
        value={colleges.length}
        icon={School}
        subtitle="Institutions issuing ID cards"
        colorScheme="indigo"
        isLoading={isLoading}
      />
      <DashboardStatCard
        title="Ready to Print"
        value={totals.readyToPrint}
        icon={Printer}
        subtitle="Batch print-ready cards"
        colorScheme="emerald"
        isLoading={isLoading}
      />
      <DashboardStatCard
        title="Total Generated"
        value={totals.generatedCards}
        icon={Sparkles}
        subtitle="Rendered ID cards"
        colorScheme="purple"
        isLoading={isLoading}
      />
      <DashboardStatCard
        title="Pending Cards"
        value={totals.pendingCards}
        icon={Clock}
        subtitle="Awaiting generation jobs"
        colorScheme="blue"
        isLoading={isLoading}
      />
      <DashboardStatCard
        title="Failed Renders"
        value={totals.failedCards}
        icon={AlertCircle}
        subtitle="Require operator review"
        colorScheme="rose"
        isLoading={isLoading}
      />
    </div>
  );
};

export default SuperAdminPrintSummary;
