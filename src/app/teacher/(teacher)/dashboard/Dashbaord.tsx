"use client";

import { useState, useEffect,useRef, useMemo } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  AlertCircle,
  Search,
  Activity,
  Stethoscope,
  Heart,
  Brain,
  Users,
  ClipboardList,
  Star,
  ChevronDown,
  ChevronUp,
  X,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "react-toastify";

// Utility functions
const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "text-blue-700 bg-blue-100 border-blue-200";
    case "approved":
      return "text-green-700 bg-green-100 border-green-200";
    case "rejected":
      return "text-red-700 bg-red-100 border-red-200";
    case "submitted":
      return "text-gray-700 bg-yellow-100 border-gray-200";
    case "draft":
      return "text-gray-700 bg-gray-100 border-gray-200";
    default:
      return "text-gray-700 bg-gray-100 border-gray-200";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "text-red-700 bg-red-50 border-red-200";
    case "medium":
      return "text-yellow-700 bg-yellow-50 border-yellow-200";
    case "low":
      return "text-green-700 bg-green-50 border-green-200";
    default:
      return "text-gray-700 bg-gray-50 border-gray-200";
  }
};
const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  return new Date(d.setDate(diff));
};

const getEndOfWeek = (date: Date) => {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
};

const formatDateForInput = (date: Date) => {
  return date.toISOString().split("T")[0];
};

const getDepartmentIcon = (department: string) => {
  switch (department.toLowerCase()) {
    case "cardiology":
      return <Heart className="w-5 h-5 text-red-500" />;
    case "orthopedics":
      return <Activity className="w-5 h-5 text-blue-500" />;
    case "emergency":
      return <AlertCircle className="w-5 h-5 text-orange-500" />;
    case "pediatrics":
      return <Users className="w-5 h-5 text-green-500" />;
    case "neurology":
      return <Brain className="w-5 h-5 text-purple-500" />;
    default:
      return <Stethoscope className="w-5 h-5 text-gray-500" />;
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateString;
  }
};

const StatsCard = ({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  borderColor,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
}) => (
  <div
    className={`bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6 border-l-4 ${borderColor}`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs lg:text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl lg:text-3xl font-bold ${color}`}>{value}</p>
      </div>
      <div className={`p-2 lg:p-3 ${bgColor} rounded-xl`}>
        <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-current" />
      </div>
    </div>
  </div>
);

interface SearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  learnerFilter: string;
  setLearnerFilter: (learner: string) => void;
  learners: Array<{ value: string; label: string }>;
}

export const SearchAndFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  learnerFilter,
  setLearnerFilter,
  learners,
}: SearchAndFiltersProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
console.log("learners", learners);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleThisWeek = () => {
    const today = new Date();
    setStartDate(formatDateForInput(getStartOfWeek(today)));
    setEndDate(formatDateForInput(getEndOfWeek(today)));
    setShowDatePicker(false);
  };

  const handleLastWeek = () => {
    const today = new Date();
    const lastWeek = new Date(today.setDate(today.getDate() - 7));
    setStartDate(formatDateForInput(getStartOfWeek(lastWeek)));
    setEndDate(formatDateForInput(getEndOfWeek(lastWeek)));
    setShowDatePicker(false);
  };

  const handleClearDates = () => {
    setStartDate("");
    setEndDate("");
    setShowDatePicker(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow typing multiple words in search
    setSearchTerm(e.target.value);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-100">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search Input - Fixed to allow multiple words */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="search"
              name="search"
              type="text"
              placeholder="Search by name, department, or task..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-sm"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="min-w-[180px]">
          <label htmlFor="status" className="sr-only">
            Status
          </label>
          <div className="relative">
            <select
              id="status"
              name="status"
              className="block w-full pl-3 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Needs Revision</option>
            </select>
          </div>
        </div>

        {/* Learner Filter */}
        <div className="min-w-[180px]">
          <label htmlFor="learner" className="sr-only">
            Learner
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <select
              id="learner"
              name="learner"
              className="block w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 appearance-none"
              value={learnerFilter}
              onChange={(e) => setLearnerFilter(e.target.value)}
            >
              <option value="all">All Learners</option>
              {learners.map((learner) => (
                <option key={learner.id} value={learner.value}>
                  {learner.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Enhanced Date Range Filter with Popup */}
        <div className="min-w-[180px]" ref={datePickerRef}>
          <label htmlFor="date-range" className="sr-only">
            Date Range
          </label>
          <div className="relative">
            <button
              id="date-range"
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`inline-flex justify-between items-center w-full px-3 py-2.5 border rounded-lg shadow-sm text-sm font-medium ${
                showDatePicker
                  ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center">
                <CalendarIcon className={`h-5 w-5 mr-2 ${
                  showDatePicker ? "text-blue-500" : "text-gray-400"
                }`} />
                <span className={showDatePicker ? "text-blue-600" : "text-gray-700"}>
                  Date Range
                </span>
              </div>
              {showDatePicker ? (
                <ChevronUp className="h-5 w-5 text-blue-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {/* Date Picker Popup */}
            {showDatePicker && (
              <div className="absolute right-0 mt-2 w-[360px] bg-white rounded-lg shadow-xl z-20 p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-900">Select Date Range</h3>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="start-date" className="block text-xs font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <div className="relative">
                      <input
                        id="start-date"
                        type="date"
                        className="block w-full pl-3 pr-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="end-date" className="block text-xs font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <div className="relative">
                      <input
                        id="end-date"
                        type="date"
                        className="block w-full pl-3 pr-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    type="button"
                    onClick={handleThisWeek}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    This Week
                  </button>
                  <button
                    type="button"
                    onClick={handleLastWeek}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Last Week
                  </button>
                  <button
                    type="button"
                    onClick={handleClearDates}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Clear Dates
                  </button>
                </div>
                
                {startDate && endDate && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-md border border-gray-200">
                    <span className="font-medium">Selected range:</span>{" "}
                    {new Date(startDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })} -{" "}
                    {new Date(endDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MedicalDashboard = ({
  submissions,
  stats,
  getDepartmentIcon,
  searchTerm = "",
  statusFilter = "all",
}: {
  submissions: any[];
  stats?: any;
  getDepartmentIcon?: (department: string) => React.ReactNode;
  searchTerm?: string;
  statusFilter?: string;
}) => {
  const [selectedMetric, setSelectedMetric] = useState("totalCases");
  const [selectedLearner, setSelectedLearner] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const metrics = [
    { value: "totalCases", label: "Total Cases" },
    { value: "approvedCases", label: "Approved Cases" },
    { value: "rejectedCases", label: "Rejected Cases" },
    { value: "pendingCases", label: "Pending Cases" },
    { value: "completedCases", label: "Completed Cases" },
  ];

  const learners = [
    ...Array.from(
      new Map(
        submissions.map((item) => [item.learnerId, item.learnerName])
      ).entries()
    ).map(([value, label]) => ({ value, label })),
  ];

  const departments = [
    { value: "all", label: "All Departments" },
    // ...Array.from(new Set(submissions.map((item) => item.department)).filter(Boolean)
    //   .map((dept) => ({ value: dept, label: dept })),)
  ];

  const filteredData = useMemo(() => {
    let filtered = submissions;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.learnerName?.toLowerCase().includes(term) ||
          item.taskTitle?.toLowerCase().includes(term) ||
          item.learnerId?.toLowerCase().includes(term) ||
          item.department?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Apply learner filter
    if (selectedLearner !== "all") {
      filtered = filtered.filter((item) => item.learnerId === selectedLearner);
    }

    // Apply department filter
    if (selectedDepartment !== "all") {
      filtered = filtered.filter(
        (item) => item.department === selectedDepartment
      );
    }

    return filtered;
  }, [
    submissions,
    searchTerm,
    statusFilter,
    selectedLearner,
    selectedDepartment,
  ]);

  // Data for Bar Chart - Learner Progress
  const learnerProgressData = useMemo(() => {
    return filteredData.map((item) => ({
      name: item.learnerName,
      totalCases: item.totalCases || 0,
      approvedCases: item.approvedCases || 0,
      rejectedCases: item.rejectedCases || 0,
      pendingCases: item.pendingCases || 0,
      completedCases: item.completedCases || 0,
    }));
  }, [filteredData]);

  // Data for Pie Chart - Overall Status Distribution
  const statusData = useMemo(() => {
    const totals = filteredData.reduce(
      (acc, item) => {
        acc.approved += item.approvedCases || 0;
        acc.rejected += item.rejectedCases || 0;
        acc.pending += item.pendingCases || 0;
        acc.completed += item.completedCases || 0;
        return acc;
      },
      { approved: 0, rejected: 0, pending: 0, completed: 0 }
    );

    return [
      { name: "Approved", value: totals.approved, color: "#10B981" },
      { name: "Rejected", value: totals.rejected, color: "#EF4444" },
      { name: "Pending", value: totals.pending, color: "#F59E0B" },
      { name: "Completed", value: totals.completed, color: "#3B82F6" },
    ];
  }, [filteredData]);

  // Summary Statistics
  const summaryStats = useMemo(() => {
    const totals = filteredData.reduce(
      (acc, item) => {
        acc.totalCases += item.totalCases || 0;
        acc.approvedCases += item.approvedCases || 0;
        acc.rejectedCases += item.rejectedCases || 0;
        acc.pendingCases += item.pendingCases || 0;
        acc.completedCases += item.completedCases || 0;
        return acc;
      },
      {
        totalCases: 0,
        approvedCases: 0,
        rejectedCases: 0,
        pendingCases: 0,
        completedCases: 0,
      }
    );

    const approvalRate =
      totals.totalCases > 0
        ? ((totals.approvedCases / totals.totalCases) * 100).toFixed(1)
        : "0";
    const completionRate =
      totals.totalCases > 0
        ? ((totals.completedCases / totals.totalCases) * 100).toFixed(1)
        : "0";

    return { ...totals, approvalRate, completionRate };
  }, [filteredData]);

  const COLORS = ["#10B981", "#EF4444", "#F59E0B", "#3B82F6"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto">
        {/* Filters */}
        {/* <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metric
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {metrics.map((metric) => (
                  <option key={metric.value} value={metric.value}>
                    {metric.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learner
              </label>
              <select
                value={selectedLearner}
                onChange={(e) => setSelectedLearner(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {learners.map((learner) => (
                  <option key={learner.value} value={learner.value}>
                    {learner.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {departments.map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div> */}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          <StatsCard
            title="Total Submissions"
            value={summaryStats.totalCases || 0}
            icon={ClipboardList}
            color="text-blue-600"
            bgColor="bg-blue-100"
            borderColor="border-blue-500"
          />
          <StatsCard
            title="Pending Review"
            value={summaryStats.pendingCases || 0}
            icon={Clock}
            color="text-yellow-600"
            bgColor="bg-yellow-100"
            borderColor="border-yellow-500"
          />
          <StatsCard
            title="Approved"
            value={summaryStats.approvedCases || 0}
            icon={CheckCircle}
            color="text-green-600"
            bgColor="bg-green-100"
            borderColor="border-green-500"
          />
          <StatsCard
            title="Needs Revision"
            value={summaryStats.rejectedCases || 0}
            icon={XCircle}
            color="text-red-600"
            bgColor="bg-red-100"
            borderColor="border-red-500"
          />
          <StatsCard
            title="Active Students"
            value={filteredData.length || 0}
            icon={Star}
            color="text-purple-600"
            bgColor="bg-purple-100"
            borderColor="border-purple-500"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart - Learner Progress */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Learner Progress Overview
            </h2>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Case Status Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Individual Learner Performance */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Individual Learner Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Learner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
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
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {learner.learnerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {learner.learnerId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {getDepartmentIcon(learner.department)}
                        <span className="ml-2">{learner.department}</span>
                      </div>
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
                          style={{
                            width: `${
                              learner.totalCases > 0
                                ? (learner.approvedCases / learner.totalCases) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {learner.totalCases > 0
                          ? (
                              (learner.approvedCases / learner.totalCases) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
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

const TeacherDashboard = () => {
  const router = useRouter();
  const {
    submissions,
    loading: submissionsLoading,
    error: submissionsError,
    refetch: refetchSubmissions,
    approveSubmission,
    rejectSubmission,
    bulkApprove,
    fetchSubmissions, // Make sure this is destructured from useSubmissions
  } = useSubmissions();
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useDashboardStats();

  // State management
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [learnerFilter, setLearnerFilter] = useState("all");


  const learners = [
    ...Array.from(
      new Map(
        submissions.map((item) => [item.learnerId, item.learnerName])
      ).entries()
    ).map(([value, label]) => ({ value, label })),
  ];

  useEffect(() => {
    const today = new Date();
    setStartDate(formatDateForInput(getStartOfWeek(today)));
    setEndDate(formatDateForInput(getEndOfWeek(today)));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchSubmissions({
        search: searchTerm,
        // status: statusFilter,
        startDate,
        endDate,
      });
    };
    fetchData();
  }, [searchTerm, statusFilter, startDate, endDate]);

  // Effects
  useEffect(() => {
    refetchSubmissions();
    refetchStats();
  }, []);

  useEffect(() => {
    let filtered = submissions;

    if (searchTerm) {
      filtered = filtered.filter(
        (sub) =>
          sub.learnerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.taskTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.learnerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }

    setFilteredSubmissions(filtered);
  }, [searchTerm, statusFilter, submissions]);

  // Event handlers
  const handleOpenLogBook = (submission) => {
    setSelectedSubmission(submission);
    setCurrentCaseIndex(0);
    setShowLogModal(true);
  };

  const handleApproveCase = async () => {
    if (!selectedSubmission) return;

    try {
      const success = await approveSubmission(
        selectedSubmission.cases[currentCaseIndex].id,
        "Case approved by teacher"
      );

      if (success) {
        setShowLogModal(false);
        refetchSubmissions();
        refetchStats();
      }
    } catch (error) {
      console.error("Error approving submission:", error);
    }
  };

  const handleRejectCase = async () => {
    if (!rejectComment.trim()) {
      toast.success("Please provide a reason for rejection");
      return;
    }

    if (!selectedSubmission) return;

    try {
      const success = await rejectSubmission(
        selectedSubmission.cases[currentCaseIndex].id,
        rejectComment,
        "Quality issues"
      );

      if (success) {
        setShowLogModal(false);
        setRejectComment("");
        refetchSubmissions();
        refetchStats();
      }
    } catch (error) {
      console.error("Error rejecting submission:", error);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedSubmissionIds.length === 0) {
      toast.error("Please select submissions to approve");
      return;
    }

    try {
      const success = await bulkApprove(
        selectedSubmissionIds,
        "Bulk approved by teacher"
      );

      if (success) {
        setSelectedSubmissionIds([]);
        refetchSubmissions();
        refetchStats();
      }
    } catch (error) {
      console.error("Error bulk approving submissions:", error);
    }
  };

  // Loading and error states
  if (submissionsLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <Stethoscope className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600 font-medium">
            Loading Medical Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (submissionsError || statsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-red-700">
            Error loading dashboard
          </p>
          <button
            onClick={() => {
              refetchSubmissions();
              refetchStats();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto px-1 py-2 lg:py-2">
        <SearchAndFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          setLearnerFilter={setLearnerFilter}
          learners={learners}
        />
        <MedicalDashboard
          submissions={filteredSubmissions}
          stats={stats}
          getDepartmentIcon={getDepartmentIcon}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
        />
      </div>
    </div>
  );
};

export default TeacherDashboard;
