'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TaskStats {
  submitted: number;
  approved: number;
  rejected: number;
  resubmitted: number;
  draft: number;
}

interface TaskStatusChartProps {
  stats: TaskStats;
}

export default function TaskStatusChart({ stats }: TaskStatusChartProps) {
  const data = [
    { name: 'Approved', value: stats.approved, color: '#10B981' },
    { name: 'Submitted', value: stats.submitted, color: '#F59E0B' },
    { name: 'Rejected', value: stats.rejected, color: '#EF4444' },
    { name: 'Resubmitted', value: stats.resubmitted, color: '#3B82F6' },
    { name: 'Draft', value: stats.draft, color: '#6B7280' }
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-gray-600">{payload[0].value} cases</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Status Distribution</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}