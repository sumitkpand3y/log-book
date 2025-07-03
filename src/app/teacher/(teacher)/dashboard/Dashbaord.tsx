import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, FileText, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface Case {
  id: string;
  caseNo: string;
  date: string;
  age: number;
  sex: string;
  uhid: string;
  chiefComplaint: string;
  historyPresenting: string;
  pastHistory: string;
  personalHistory: string;
  familyHistory: string;
  clinicalExamination: string;
  labExaminations: string;
  diagnosis: string;
  management: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'DRAFT';
  rejectionReason: string;
  courseId: string;
}

interface Submission {
  id: string;
  learnerName: string;
  learnerId: string;
  taskTitle: string;
  submissionDate: string;
  dueDate: string;
  department: string;
  priority: string;
  cases: Case[];
  courseId: string;
  status: string;
  totalCases: number;
  approvedCases: number;
  rejectedCases: number;
  pendingCases: number;
  completedCases: number;
}

interface Stats {
  totalLearners: number;
  totalCases: number;
  approvedCases: number;
  rejectedCases: number;
  pendingCases: number;
  completedCases: number;
  approvalRate: number;
  completionRate: number;
}

interface MedicalDashboardProps {
  submissions: Submission[];
  stats?: Stats;
  getDepartmentIcon?: (department: string) => React.ReactNode;
}
const MedicalDashboard: React.FC<MedicalDashboardProps> = ({ 
  submissions, 
  stats, 
  getDepartmentIcon 
}) => {
  const rawData = submissions || [];

  const [selectedMetric, setSelectedMetric] = useState('totalCases');
  const [selectedLearner, setSelectedLearner] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');


  const metrics = [
    { value: 'totalCases', label: 'Total Cases' },
    { value: 'approvedCases', label: 'Approved Cases' },
    { value: 'rejectedCases', label: 'Rejected Cases' },
    { value: 'pendingCases', label: 'Pending Cases' },
    { value: 'completedCases', label: 'Completed Cases' }
  ];

  const learners = [
    { value: 'all', label: 'All Learners' },
    ...rawData.map(item => ({ value: item.learnerId, label: item.learnerName }))
  ];

  const departments = [
    { value: 'all', label: 'All Departments' },
    ...Array.from(new Set(rawData.map(item => item.department))).map(dept => ({ value: dept, label: dept }))
  ];

  const filteredData = useMemo(() => {
    let filtered = rawData;
    
    if (selectedLearner !== 'all') {
      filtered = filtered.filter(item => item.learnerId === selectedLearner);
    }
    
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(item => item.department === selectedDepartment);
    }
    
    return filtered;
  }, [selectedLearner, selectedDepartment]);

  // Data for Bar Chart - Learner Progress
  const learnerProgressData = filteredData.map(item => ({
    name: item.learnerName,
    totalCases: item.totalCases,
    approvedCases: item.approvedCases,
    rejectedCases: item.rejectedCases,
    pendingCases: item.pendingCases,
    completedCases: item.completedCases
  }));

  // Data for Pie Chart - Overall Status Distribution
  const statusData = useMemo(() => {
    const totals = filteredData.reduce((acc, item) => {
      acc.approved += item.approvedCases;
      acc.rejected += item.rejectedCases;
      acc.pending += item.pendingCases;
      acc.completed += item.completedCases;
      return acc;
    }, { approved: 0, rejected: 0, pending: 0, completed: 0 });

    return [
      { name: 'Approved', value: totals.approved, color: '#10B981' },
      { name: 'Rejected', value: totals.rejected, color: '#EF4444' },
      { name: 'Pending', value: totals.pending, color: '#F59E0B' },
      { name: 'Completed', value: totals.completed, color: '#3B82F6' }
    ];
  }, [filteredData]);

  // Summary Statistics
  const summaryStats = useMemo(() => {
    const totals = filteredData.reduce((acc, item) => {
      acc.totalCases += item.totalCases;
      acc.approvedCases += item.approvedCases;
      acc.rejectedCases += item.rejectedCases;
      acc.pendingCases += item.pendingCases;
      acc.completedCases += item.completedCases;
      return acc;
    }, { totalCases: 0, approvedCases: 0, rejectedCases: 0, pendingCases: 0, completedCases: 0 });

    const approvalRate = totals.totalCases > 0 ? ((totals.approvedCases / totals.totalCases) * 100).toFixed(1) : 0;
    const completionRate = totals.totalCases > 0 ? ((totals.completedCases / totals.totalCases) * 100).toFixed(1) : 0;

    return { ...totals, approvalRate, completionRate };
  }, [filteredData]);

  const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Cases Dashboard</h1>
          <p className="text-gray-600">Track learner progress and case statistics</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Metric</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {metrics.map(metric => (
                  <option key={metric.value} value={metric.value}>{metric.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Learner</label>
              <select
                value={selectedLearner}
                onChange={(e) => setSelectedLearner(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {learners.map(learner => (
                  <option key={learner.value} value={learner.value}>{learner.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {departments.map(dept => (
                  <option key={dept.value} value={dept.value}>{dept.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cases</p>
                <p className="text-3xl font-bold text-gray-900">{summaryStats.totalCases}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">{summaryStats.approvedCases}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{summaryStats.pendingCases}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                <p className="text-3xl font-bold text-blue-600">{summaryStats.approvalRate}%</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart - Learner Progress */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Learner Progress Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={learnerProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalCases" fill="#3B82F6" name="Total Cases" />
                <Bar dataKey="approvedCases" fill="#10B981" name="Approved" />
                <Bar dataKey="pendingCases" fill="#F59E0B" name="Pending" />
                <Bar dataKey="rejectedCases" fill="#EF4444" name="Rejected" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Individual Learner Performance */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Individual Learner Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Learner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cases
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pending
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rejected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((learner) => (
                  <tr key={learner.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {learner.learnerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {learner.taskTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {learner.totalCases}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {learner.approvedCases}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                      {learner.pendingCases}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {learner.rejectedCases}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(learner.approvedCases / learner.totalCases) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {((learner.approvedCases / learner.totalCases) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalDashboard;