import React from 'react';
import Card from './Card';
import Button from './Button';

const DashboardLayoutExample = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-black dark:text-gray-400">Overview</p>
          <h2 className="text-2xl font-black tracking-tight">Dashboard</h2>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary">Export</Button>
          <Button>New Ride</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Rides', value: '5,214' },
          { label: 'Active Drivers', value: '128' },
          { label: 'Revenue', value: '₹ 4.9L' },
          { label: 'Rating', value: '4.9' },
        ].map((kpi) => (
          <Card key={kpi.label} className="p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-black dark:text-gray-400">{kpi.label}</p>
            <p className="mt-3 text-3xl font-black text-black dark:text-white">{kpi.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <p className="text-sm font-black">Activity</p>
        <div className="mt-4 h-40 rounded-xl border border-[#e5e5e5] bg-white dark:border-white/10 dark:bg-[#1f2937]" />
      </Card>
    </div>
  );
};

export default DashboardLayoutExample;

