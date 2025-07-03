"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  MessageSquare,
  Calendar,
  AlertCircle,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  Activity,
  Stethoscope,
  Heart,
  Brain,
  Eye,
  Plus,
  Minus,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  ClipboardList,
  Star,
  Award,
  Menu,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { submissionAPI } from "@/services/submission.services";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useDashboardStats } from "@/hooks/useDashboardStats";

import MedicalDashboard from "@/app/teacher/(teacher)/dashboard/DashbaordData";

// Utility functions
const getStatusColor = (status) => {
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

const getPriorityColor = (priority) => {
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

const getDepartmentIcon = (department) => {
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

// Components
const StatsCard = ({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  borderColor,
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

const SearchAndFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}) => (
  <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6 mb-6">
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by doctor name, department, or task..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm lg:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="w-full lg:w-48">
        <select
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm lg:text-base"
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
  </div>
);

const SubmissionCard = ({ submission, handleOpenLogBook, router }) => (
  <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-gray-200 hover:shadow-xl transition-shadow">
    {/* Student Info */}
    <div className="flex items-start space-x-4 mb-4">
      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
        <User className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm lg:text-base font-bold text-gray-900 truncate">
          {submission.learnerName}
        </div>
        <div className="text-xs lg:text-sm text-gray-500 flex items-center flex-wrap gap-2">
          <span>ID: {submission.learnerId}</span>
          <div className="flex items-center gap-1">
            {getDepartmentIcon(submission.department)}
            <span className="hidden sm:inline">{submission.department}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Task Info */}
    <div className="mb-4">
      <div className="text-sm lg:text-base font-bold text-gray-900 mb-1">
        {submission.taskTitle}
      </div>
      <div className="text-xs lg:text-sm text-gray-600 line-clamp-2">
        {submission.description}
      </div>
      <div className="text-xs text-gray-500 mt-1 flex items-center">
        <Calendar className="w-3 h-3 mr-1" />
        {new Date(submission.submissionDate).toLocaleDateString()}
      </div>
    </div>

    {/* Progress */}
    <div className="mb-4">
      <div className="flex items-center justify-between text-xs lg:text-sm mb-2">
        <span className="text-gray-600">Progress:</span>
        <span className="font-semibold">{submission.totalCases} cases</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${
              submission.totalCases > 0
                ? (submission.completedCases / submission.totalCases) * 100
                : 0
            }%`,
          }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>✓ {submission.approvedCases}</span>
        <span>⏳ {submission.pendingCases}</span>
        <span>✗ {submission.rejectedCases}</span>
      </div>
    </div>

    {/* Status and Actions */}
    <div className="flex items-center justify-between">
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
          submission.status
        )}`}
      >
        {submission.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
        {submission.status === "approved" && (
          <CheckCircle className="w-3 h-3 mr-1" />
        )}
        {submission.status === "rejected" && (
          <XCircle className="w-3 h-3 mr-1" />
        )}
        {submission.status === "draft" && <FileText className="w-3 h-3 mr-1" />}
        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleOpenLogBook(submission)}
          className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-xs font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all"
        >
          <FileText className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Review</span>
        </button>
        <button
          onClick={() =>
            router.push(
              `/teacher/dashboard/new?learnerId=${submission.learnerId}&submissionId=${submission.id}`
            )
          }
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
        >
          <Eye className="w-3 h-3" />
          <span className="hidden sm:inline">View</span>
        </button>
      </div>
    </div>
  </div>
);

const SubmissionTable = ({
  filteredSubmissions,
  handleOpenLogBook,
  handleBulkApprove,
  selectedSubmissionIds,
  router,
}) => (
  <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg overflow-hidden">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <h1 className="text-2xl lg:text-xl font-bold text-gray-800 p-4">
        Log Books
      </h1>
      {selectedSubmissionIds.length > 0 && (
        <button
          onClick={handleBulkApprove}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Approve Selected ({selectedSubmissionIds.length})
        </button>
      )}
    </div>

    {/* Desktop Table */}
    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Medical Student
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Clinical Training
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Case Progress
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {filteredSubmissions.map((submission) => (
            <tr
              key={submission.id}
              className="hover:bg-blue-50 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-bold text-gray-900">
                      {submission.learnerName}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      {getDepartmentIcon(submission.department)}
                      <span className="ml-1">{submission.department}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-start">
                  {/* <div className="mr-3 mt-1">
                    {getDepartmentIcon(submission.department)}
                  </div> */}
                  <div>
                    <div className="text-xs font-bold text-gray-900">
                      {submission.taskTitle}
                    </div>
                    <div className="text-xs text-gray-600">
                      {submission.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Department: {submission.department}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div>
                  <div className="text-xs font-medium text-gray-900">
                    {submission.taskTitle}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center mt-1">
                    <Calendar className="w-4 h-4 mr-1" />

                    {new Date(submission.submissionDate).toLocaleDateString()}
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full inline-flex items-center mt-2 ${getPriorityColor(
                      submission.priority
                    )}`}
                  ></div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Cases:</span>
                    <span className="font-semibold">
                      {submission.totalCases}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          submission.totalCases > 0
                            ? (submission.completedCases /
                                submission.totalCases) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>✓ {submission.approvedCases} Approved</span>
                    <span>⏳ {submission.pendingCases} Pending</span>
                    <span>✗ {submission.rejectedCases} Rejected</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    submission.status
                  )}`}
                >
                  {submission.status === "pending" && (
                    <Clock className="w-3 h-3 mr-1" />
                  )}
                  {submission.status === "approved" && (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  )}
                  {submission.status === "rejected" && (
                    <XCircle className="w-3 h-3 mr-1" />
                  )}
                  {submission.status === "draft" && (
                    <FileText className="w-3 h-3 mr-1" />
                  )}
                  {submission.status.charAt(0).toUpperCase() +
                    submission.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenLogBook(submission)}
                    className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm leading-4 font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Review
                  </button>
                  <button
                    onClick={() => router.push("/teacher/dashboard/new")}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile Cards */}
    <div className="lg:hidden p-4 space-y-4">
      {filteredSubmissions.map((submission) => (
        <SubmissionCard
          key={submission.id}
          submission={submission}
          handleOpenLogBook={handleOpenLogBook}
          router={router}
        />
      ))}
    </div>
  </div>
);

const ReportsSection = ({ reportData, submissions, getDepartmentIcon }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6">
      <h2 className="text-xl lg:text-xl font-bold text-gray-800 mb-4 flex items-center">
        <BarChart3 className="w-6 h-6 lg:w-8 lg:h-8 mr-2 lg:mr-3 text-blue-600" />
         Reports & Analytics
      </h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 lg:p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-blue-600 font-medium">
                Total Submissions
              </p>
              <p className="text-xl lg:text-2xl font-bold text-blue-800">
                {reportData.total}
              </p>
            </div>
            <Users className="w-6 h-6 lg:w-8 lg:h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 lg:p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-green-600 font-medium">
                Success Rate
              </p>
              <p className="text-xl lg:text-2xl font-bold text-green-800">
                {reportData.approvalRate}%
              </p>
            </div>
            <Award className="w-6 h-6 lg:w-8 lg:h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 lg:p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-yellow-600 font-medium">
                Avg. Review Time
              </p>
              <p className="text-xl lg:text-2xl font-bold text-yellow-800">
                2.5h
              </p>
            </div>
            <Clock className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 lg:p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-purple-600 font-medium">
                Active Students
              </p>
              <p className="text-xl lg:text-2xl font-bold text-purple-800">
                {submissions.length}
              </p>
            </div>
            <Star className="w-6 h-6 lg:w-8 lg:h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      {/* <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <PieChart className="w-5 h-5 mr-2" />
          Submission Status Distribution
        </h3>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
          <div className="relative w-48 h-48 lg:w-64 lg:h-64">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              {reportData.pieData.map((item, index) => {
                const total = reportData.total;
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                const circumference = 2 * Math.PI * 30;
                const strokeDasharray = `${
                  (percentage / 100) * circumference
                } ${circumference}`;
                const strokeDashoffset = -reportData.pieData
                  .slice(0, index)
                  .reduce(
                    (acc, curr) => acc + (curr.value / total) * circumference,
                    0
                  );

                return (
                  <circle
                    key={item.name}
                    cx="50"
                    cy="50"
                    r="30"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-gray-800">
                  {reportData.total}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3 lg:ml-6">
            {reportData.pieData.map((item) => (
              <div key={item.name} className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm font-medium text-gray-700">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* Department Performance */}
      {/* <div className="mt-6 lg:mt-8">
        <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4">
          Department Performance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {["Cardiology", "Orthopedics", "Emergency", "Pediatrics"].map(
            (dept) => {
              const deptSubmissions = submissions.filter(
                (s) => s.department === dept
              );
              const deptApproved = deptSubmissions.filter(
                (s) => s.status === "approved"
              ).length;
              const deptRate =
                deptSubmissions.length > 0
                  ? ((deptApproved / deptSubmissions.length) * 100).toFixed(1)
                  : 0;

              return (
                <div
                  key={dept}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center mb-2">
                    {getDepartmentIcon(dept)}
                    <h4 className="ml-2 font-medium text-gray-800 text-sm lg:text-base">
                      {dept}
                    </h4>
                  </div>
                  <div className="text-xl lg:text-2xl font-bold text-gray-900">
                    {deptRate}%
                  </div>
                  <div className="text-xs lg:text-sm text-gray-600">
                    {deptSubmissions.length} submissions
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${deptRate}%` }}
                    ></div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div> */}
    </div>
  </div>
);

// StatusIcon component for status display in table
const StatusIcon = ({ status }) => {
  switch (status) {
    case "pending":
      return <Clock className="w-3 h-3 mr-1" />;
    case "approved":
      return <CheckCircle className="w-3 h-3 mr-1" />;
    case "rejected":
      return <XCircle className="w-3 h-3 mr-1" />;
    case "draft":
      return <FileText className="w-3 h-3 mr-1" />;
    default:
      return null;
  }
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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          sub.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        alert("Submission approved successfully!");
        refetchStats();
      } else {
        alert("Failed to approve submission. Please try again.");
      }
    } catch (error) {
      console.error("Error approving submission:", error);
      alert("Error approving submission. Please try again.");
    }
  };

  const handleRejectCase = async () => {
    if (!rejectComment.trim()) {
      alert("Please provide a reason for rejection");
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
        alert("Submission rejected. Student will be notified for corrections.");
        refetchStats();
      } else {
        alert("Failed to reject submission. Please try again.");
      }
    } catch (error) {
      console.error("Error rejecting submission:", error);
      alert("Error rejecting submission. Please try again.");
    }
  };

  const handleBulkApprove = async () => {
    if (selectedSubmissionIds.length === 0) {
      alert("Please select submissions to approve");
      return;
    }

    try {
      const success = await bulkApprove(
        selectedSubmissionIds,
        "Bulk approved by teacher"
      );

      if (success) {
        alert(
          `${selectedSubmissionIds.length} submissions approved successfully!`
        );
        setSelectedSubmissionIds([]);
        refetchStats();
      } else {
        alert("Failed to bulk approve submissions. Please try again.");
      }
    } catch (error) {
      console.error("Error bulk approving submissions:", error);
      alert("Error bulk approving submissions. Please try again.");
    }
  };

  const handleSelectSubmission = (submissionId) => {
    setSelectedSubmissionIds((prev) =>
      prev.includes(submissionId)
        ? prev.filter((id) => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSubmissionIds.length === filteredSubmissions.length) {
      setSelectedSubmissionIds([]);
    } else {
      setSelectedSubmissionIds(filteredSubmissions.map((sub) => sub.id));
    }
  };

  const nextCase = () => {
    if (
      selectedSubmission &&
      currentCaseIndex < selectedSubmission.cases.length - 1
    ) {
      setCurrentCaseIndex(currentCaseIndex + 1);
    }
  };

  const prevCase = () => {
    if (currentCaseIndex > 0) {
      setCurrentCaseIndex(currentCaseIndex - 1);
    }
  };

  const handleNextCase = () => {
    if (
      selectedSubmission &&
      currentCaseIndex < selectedSubmission.cases.length - 1
    ) {
      setCurrentCaseIndex(currentCaseIndex + 1);
    }
  };
  const getTableStatusColor = (status: string): string => {
    const colors = {
      APPROVED: "bg-green-100 text-green-800 border-green-300",
      DRAFT: "bg-yellow-100 text-yellow-800 border-yellow-300",
      REJECTED: "bg-red-100 text-red-800 border-red-300",
      SUBMITTED: "bg-orange-100 text-orange-800 border-orange-300",
      RESUBMITTED: "bg-blue-100 text-blue-800 border-blue-300",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 border-gray-300"
    );
  };

  const handlePreviousCase = () => {
    if (currentCaseIndex > 0) {
      setCurrentCaseIndex(currentCaseIndex - 1);
    }
  };

  // Calculate report data
  const reportData = {
    total: stats?.summary?.total,
    pending: stats?.summary?.pending,
    approved: stats?.summary?.approved,
    rejected: submissions.filter((s) => s.status === "rejected").length,
    approvalRate:
      submissions.length > 0
        ? (
            (submissions.filter((s) => s.status === "approved").length /
              submissions.length) *
            100
          ).toFixed(1)
        : 0,
    pieData: stats?.chartData?.pieData || [],
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
    <div className="min-h-screen ">
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-lg"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div
        className={`${
          isMobileMenuOpen ? "block" : "hidden"
        } lg:block fixed lg:static top-0 left-0 w-full lg:w-auto bg-white lg:bg-transparent shadow-lg lg:shadow-none z-40`}
      >
        <div className="flex flex-col lg:flex-row lg:justify-center p-4 lg:p-6 gap-2 lg:gap-4">
          <button
            onClick={() => {
              setActiveTab("dashboard");
              setIsMobileMenuOpen(false);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "dashboard"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-blue-50"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveTab("submissions");
              setIsMobileMenuOpen(false);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "submissions"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-blue-50"
            }`}
          >
            Submissions
          </button>
          <button
            onClick={() => {
              setActiveTab("reports");
              setIsMobileMenuOpen(false);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "reports"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-blue-50"
            }`}
          >
            Reports
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className=" mx-auto px-1 py-2 lg:py-8">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-3">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <StatsCard
                title="Total Submissions"
                value={stats?.summary.total || reportData.total}
                icon={ClipboardList}
                color="text-blue-600"
                bgColor="bg-blue-100"
                borderColor="border-blue-500"
              />
              <StatsCard
                title="Pending Review"
                value={stats?.summary.pending || reportData.pending}
                icon={Clock}
                color="text-yellow-600"
                bgColor="bg-yellow-100"
                borderColor="border-yellow-500"
              />
              <StatsCard
                title="Approved"
                value={stats?.summary.approved || reportData.approved}
                icon={CheckCircle}
                color="text-green-600"
                bgColor="bg-green-100"
                borderColor="border-green-500"
              />
              <StatsCard
                title="Needs Revision"
                value={stats?.summary.rejected || reportData.rejected}
                icon={XCircle}
                color="text-red-600"
                bgColor="bg-red-100"
                borderColor="border-red-500"
              />
            </div>

            {/* Quick Actions */}
            {/* <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab("submissions")}
                  className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <FileText className="w-6 h-6 text-blue-600 mr-3" />
                  <span className="font-medium text-blue-800">
                    Review Submissions
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("reports")}
                  className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <BarChart3 className="w-6 h-6 text-green-600 mr-3" />
                  <span className="font-medium text-green-800">
                    View Reports
                  </span>
                </button>
              </div>
            </div> */}

            {/* Recent Submissions Preview */}
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
                  Recent Submissions
                </h2>
                <button
                  onClick={() => setActiveTab("submissions")}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Case Details
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                        Course
                      </th>

                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Last Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {stats?.recentActivity?.map((entry) => (
                      <tr
                        key={entry.id}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {entry.studentName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              {entry.courseTitle}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              entry.status
                            )}`}
                          >
                            {entry.status === "pending" && (
                              <Clock className="w-3 h-3 mr-1" />
                            )}
                            {entry.status === "approved" && (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            {entry.status === "rejected" && (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {entry.status === "submitted" && (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {entry.status === "draft" && (
                              <FileText className="w-3 h-3 mr-1" />
                            )}
                            {entry.status.charAt(0).toUpperCase() +
                              entry.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className="text-sm text-gray-500">
                            {formatDate(entry.updatedAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* {stats?.recentActivity?.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {submission.studentName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {submission.department}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {submission.courseTitle}
                        </div>
                        <div className="text-sm text-gray-500">
                          {submission.caseNo}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        submission.status
                      )}`}
                    >
                      {submission.status === "pending" && (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {submission.status === "approved" && (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      )}
                      {submission.status === "rejected" && (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {submission.status === "submitted" && (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {submission.status === "draft" && (
                        <FileText className="w-3 h-3 mr-1" />
                      )}
                      {submission.status.charAt(0).toUpperCase() +
                        submission.status.slice(1)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium `}
                    >
                      {formatDate(submission.updatedAt)}
                    </span>
                  </div>
                ))} */}
              </div>
            </div>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === "submissions" && (
          <div className="space-y-6">
            {/* <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <h1 className="text-2xl lg:text-2xl font-bold text-gray-800">
                Log Books
              </h1>
              
            </div> */}

            <SearchAndFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />

            <SubmissionTable
              filteredSubmissions={filteredSubmissions}
              handleOpenLogBook={handleOpenLogBook}
              handleBulkApprove={handleBulkApprove}
              selectedSubmissionIds={selectedSubmissionIds}
              router={router}
            />
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            {/* <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
              Clinical Training Reports
            </h1> */}
            <ReportsSection
              reportData={reportData}
              submissions={submissions}
              getDepartmentIcon={getDepartmentIcon}
            />
            <MedicalDashboard
              submissions={submissions}
              stats={stats}
              getDepartmentIcon={getDepartmentIcon}
            />
          </div>
        )}
      </div>

      {/* Enhanced Log Book Review Modal */}
      {showLogModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-white">
                  <Stethoscope className="w-6 h-6 mr-3" />
                  <div>
                    <h3 className="text-lg font-bold">Clinical Case Review</h3>
                    <p className="text-blue-100 text-sm">
                      {selectedSubmission.learnerName} -{" "}
                      {selectedSubmission.department}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex flex-col h-full max-h-[calc(90vh-80px)]">
              {/* Progress Bar */}
              <div className="px-6 py-4 bg-gray-50 border-b">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Case {currentCaseIndex + 1} of{" "}
                    {selectedSubmission.cases.length}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedSubmission.cases[currentCaseIndex]?.status ===
                      "Submitted"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedSubmission.cases[currentCaseIndex]?.status ===
                          "Approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedSubmission.cases[currentCaseIndex]?.status}
                  </span>
                </div>
                {/* <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((currentLogIndex + 1) /
                          (mockLogBookSteps[selectedSubmission.id]?.length ||
                            1)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div> */}
              </div>

              {/* Step Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {selectedSubmission.cases[currentCaseIndex] && (
                  <div className="space-y-6">
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Patient Information */}
                        <div className="space-y-4">
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                            <h4 className="font-bold text-blue-800 mb-3 flex items-center">
                              <User className="w-5 h-5 mr-2" />
                              Patient Information
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600">Case No:</span>
                                <p className="font-semibold">
                                  {
                                    selectedSubmission.cases[currentCaseIndex]
                                      .caseNo
                                  }
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">Date:</span>
                                <p className="font-semibold">
                                  {
                                    selectedSubmission.cases[currentCaseIndex]
                                      .date
                                  }
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">Age:</span>
                                <p className="font-semibold">
                                  {
                                    selectedSubmission.cases[currentCaseIndex]
                                      .age
                                  }{" "}
                                  years
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">Gender:</span>
                                <p className="font-semibold">
                                  {
                                    selectedSubmission.cases[currentCaseIndex]
                                      .sex
                                  }
                                </p>
                              </div>
                              <div className="col-span-2">
                                <span className="text-gray-600">UHID:</span>
                                <p className="font-semibold">
                                  {
                                    selectedSubmission.cases[currentCaseIndex]
                                      .uhid
                                  }
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                            <h4 className="font-bold text-orange-800 mb-2">
                              Chief Complaint
                            </h4>
                            <p className="text-sm text-gray-700">
                              {
                                selectedSubmission.cases[currentCaseIndex]
                                  .chiefComplaint
                              }
                            </p>
                          </div>

                          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                            <h4 className="font-bold text-green-800 mb-2">
                              History of Presenting Illness
                            </h4>
                            <p className="text-sm text-gray-700">
                              {
                                selectedSubmission.cases[currentCaseIndex]
                                  .historyPresenting
                              }
                            </p>
                          </div>
                        </div>

                        {/* Medical History & Examination */}
                        <div className="space-y-4">
                          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                            <h4 className="font-bold text-purple-800 mb-2">
                              Past Medical History
                            </h4>
                            <p className="text-sm text-gray-700">
                              {
                                selectedSubmission.cases[currentCaseIndex]
                                  .pastHistory
                              }
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <h4 className="font-bold text-gray-800 mb-2">
                              Clinical Examination
                            </h4>
                            <p className="text-sm text-gray-700">
                              {
                                selectedSubmission.cases[currentCaseIndex]
                                  .clinicalExamination
                              }
                            </p>
                          </div>

                          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                            <h4 className="font-bold text-red-800 mb-2">
                              Laboratory Examinations
                            </h4>
                            <p className="text-sm text-gray-700">
                              {
                                selectedSubmission.cases[currentCaseIndex]
                                  .labExaminations
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Diagnosis & Management */}
                      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                          <h4 className="font-bold text-indigo-800 mb-2 flex items-center">
                            <Activity className="w-5 h-5 mr-2" />
                            Diagnosis
                          </h4>
                          <p className="text-sm text-gray-700">
                            {
                              selectedSubmission.cases[currentCaseIndex]
                                .diagnosis
                            }
                          </p>
                        </div>

                        <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
                          <h4 className="font-bold text-teal-800 mb-2 flex items-center">
                            <Heart className="w-5 h-5 mr-2" />
                            Management
                          </h4>
                          <p className="text-sm text-gray-700">
                            {
                              selectedSubmission.cases[currentCaseIndex]
                                .management
                            }
                          </p>
                        </div>
                      </div>

                      {/* Rejection Reason (if applicable) */}
                      {selectedSubmission.cases[currentCaseIndex].status ===
                        "Rejected" &&
                        selectedSubmission.cases[currentCaseIndex]
                          .rejectionReason && (
                          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                            <h4 className="font-bold text-red-800 mb-2 flex items-center">
                              <AlertCircle className="w-5 h-5 mr-2" />
                              Rejection Reason
                            </h4>
                            <p className="text-sm text-red-700">
                              {
                                selectedSubmission.cases[currentCaseIndex]
                                  .rejectionReason
                              }
                            </p>
                          </div>
                        )}
                    </div>

                    {/* Rejection Comment Section */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-red-600" />
                        Comments (required for rejection):
                      </h5>
                      <textarea
                        value={rejectComment}
                        onChange={(e) => setRejectComment(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Provide feedback or reason for rejection..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                <div className="flex space-x-3">
                  <button
                    onClick={handlePreviousCase}
                    disabled={currentCaseIndex === 0}
                    className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                  <button
                    onClick={handleNextCase}
                    disabled={
                      currentCaseIndex === selectedSubmission.cases.length - 1
                    }
                    className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleRejectCase}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors flex items-center"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Case
                  </button>
                  <button
                    onClick={handleApproveCase}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Case
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
