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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { submissionAPI } from "@/services/submission.services";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useDashboardStats } from "@/hooks/useDashboardStats";

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
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState([]);
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

  const handleOpenLogBook = (submission) => {
    // setSelectedSubmission(submission);
    // // Find first pending (submitted) case
    // const pendingCaseIndex = submission.cases.findIndex(
    //   (c) => c.status === "Submitted"
    // );
    // setCurrentCaseIndex(pendingCaseIndex >= 0 ? pendingCaseIndex : 0);
    // setShowLogModal(true);
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
        // Refresh stats after approval
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
        // Refresh stats after rejection
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
        // Refresh stats after bulk approval
        refetchStats();
      } else {
        alert("Failed to bulk approve submissions. Please try again.");
      }
    } catch (error) {
      console.error("Error bulk approving submissions:", error);
      alert("Error bulk approving submissions. Please try again.");
    }
  };

  const handleExport = async () => {
    try {
      const response = await submissionAPI.exportSubmissions();
      // Handle file download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "submissions.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export submissions");
    }
  };
  const handleNextCase = () => {
    const pendingCases = selectedSubmission.cases.filter(
      (c) => c.status === "SUBMITTED"
    );
    const currentPendingIndex = pendingCases.findIndex(
      (c) => c.id === selectedSubmission.cases[currentCaseIndex].id
    );

    if (currentPendingIndex < pendingCases.length - 1) {
      const nextPendingCase = pendingCases[currentPendingIndex + 1];
      const nextIndex = selectedSubmission.cases.findIndex(
        (c) => c.id === nextPendingCase.id
      );
      setCurrentCaseIndex(nextIndex);
    }
  };

  const handlePreviousCase = () => {
    const pendingCases = selectedSubmission.cases.filter(
      (c) => c.status === "SUBMITTED"
    );
    const currentPendingIndex = pendingCases.findIndex(
      (c) => c.id === selectedSubmission.cases[currentCaseIndex].id
    );

    if (currentPendingIndex > 0) {
      const prevPendingCase = pendingCases[currentPendingIndex - 1];
      const prevIndex = selectedSubmission.cases.findIndex(
        (c) => c.id === prevPendingCase.id
      );
      setCurrentCaseIndex(prevIndex);
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-blue-700 bg-blue-100 border-blue-200";
      case "approved":
        return "text-green-700 bg-green-100 border-green-200";
      case "rejected":
        return "text-red-700 bg-red-100 border-red-200";
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

  const getReportData = () => {
    // Use stats from API if available, otherwise calculate from submissions
    if (stats && Object.keys(stats).length > 0) {
      return {
        total: stats.totalSubmissions || 0,
        approved: stats.approvedSubmissions || 0,
        rejected: stats.rejectedSubmissions || 0,
        pending: stats.pendingSubmissions || 0,
        approvalRate:
          stats.totalSubmissions > 0
            ? (
                (stats.approvedSubmissions / stats.totalSubmissions) *
                100
              ).toFixed(1)
            : 0,
        pieData: [
          {
            name: "Approved",
            value: stats.approvedSubmissions || 0,
            color: "#10b981",
          },
          {
            name: "Pending",
            value: stats.pendingSubmissions || 0,
            color: "#3b82f6",
          },
          {
            name: "Rejected",
            value: stats.rejectedSubmissions || 0,
            color: "#ef4444",
          },
        ],
      };
    }

    // Fallback to calculating from submissions array
    const total = submissions.length;
    const approved = submissions.filter((s) => s.status === "approved").length;
    const rejected = submissions.filter((s) => s.status === "rejected").length;
    const pending = submissions.filter((s) => s.status === "pending").length;

    return {
      total,
      approved,
      rejected,
      pending,
      approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) : 0,
      pieData: [
        { name: "Approved", value: approved, color: "#10b981" },
        { name: "Pending", value: pending, color: "#3b82f6" },
        { name: "Rejected", value: rejected, color: "#ef4444" },
      ],
    };
  };

  const reportData = getReportData();

  if (submissionsLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-sm w-full">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600 font-medium text-sm sm:text-base">
            Loading Medical Dashboard...
          </p>
        </div>
      </div>
    );
  }
  // Error state
  if (submissionsError || statsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{submissionsError || statsError}</p>
          <button
            onClick={() => {
              refetchSubmissions();
              refetchStats();
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Medical Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-xl">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-2 rounded-xl">
                <Stethoscope className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Medical Training Dashboard
                </h1>
                <p className="text-blue-100">
                  Clinical Log Book Management System
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === "dashboard"
                    ? "bg-white text-blue-600 shadow-lg"
                    : "text-white hover:bg-blue-500"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === "reports"
                    ? "bg-white text-blue-600 shadow-lg"
                    : "text-white hover:bg-blue-500"
                }`}
              >
                Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && (
          <>
            {/* Medical Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Pending Reviews
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {reportData.pending}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Approved
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {reportData.approved}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Needs Revision
                    </p>
                    <p className="text-3xl font-bold text-red-600">
                      {reportData.rejected}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-xl">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Success Rate
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {reportData.approvalRate}%
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by doctor name, department, or task..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
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

            {/* Clinical Log Books */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <ClipboardList className="w-6 h-6 mr-2 text-blue-600" />
                  Clinical Log Book Submissions
                </h2>
              </div>

              <div className="overflow-x-auto">
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
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900">
                                {submission.learnerName}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <span className="mr-2">
                                  ID: {submission.learnerId}
                                </span>
                                {/* <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                                    submission.priority
                                  )}`}
                                >
                                  {submission.priority} priority
                                </span> */}
                                {getDepartmentIcon(submission.department)}
                                <span className="ml-1">
                                  {submission.department}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <div className="mr-3 mt-1">
                              {getDepartmentIcon(submission.department)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">
                                {submission.taskTitle}
                              </div>
                              <div className="text-sm text-gray-600">
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
                            <div className="text-sm font-medium text-gray-900">
                              {submission.taskTitle}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Calendar className="w-4 h-4 mr-1" />
                              Submitted:{" "}
                              {new Date(
                                submission.submissionDate
                              ).toLocaleDateString()}
                            </div>
                            <div
                              className={`text-xs px-2 py-1 rounded-full inline-flex items-center mt-2 ${getPriorityColor(
                                submission.priority
                              )}`}
                            >
                              <span className="w-2 h-2 rounded-full bg-current mr-1"></span>
                              {submission.priority.toUpperCase()} PRIORITY
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                Total Cases:
                              </span>
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
                              className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm leading-4 font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Review Cases
                            </button>
                            <button
                              onClick={() =>
                                router.push("/teacher/dashboard/new")
                              }
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View File
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "reports" && (
          <div className="space-y-6">
            {/* Report Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
                Clinical Training Reports & Analytics
              </h2>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">
                        Total Submissions
                      </p>
                      <p className="text-2xl font-bold text-blue-800">
                        {reportData.total}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        Success Rate
                      </p>
                      <p className="text-2xl font-bold text-green-800">
                        {reportData.approvalRate}%
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">
                        Avg. Review Time
                      </p>
                      <p className="text-2xl font-bold text-yellow-800">2.5h</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">
                        Active Students
                      </p>
                      <p className="text-2xl font-bold text-purple-800">
                        {reportData.pending + reportData.approved}
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Pie Chart Visualization */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Submission Status Distribution
                </h3>
                <div className="flex items-center justify-center">
                  <div className="relative w-64 h-64">
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      {reportData.pieData.map((item, index) => {
                        const total = reportData.total;
                        const percentage =
                          total > 0 ? (item.value / total) * 100 : 0;
                        const circumference = 2 * Math.PI * 30;
                        const strokeDasharray = `${
                          (percentage / 100) * circumference
                        } ${circumference}`;
                        const strokeDashoffset = -reportData.pieData
                          .slice(0, index)
                          .reduce(
                            (acc, curr) =>
                              acc + (curr.value / total) * circumference,
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
                        <div className="text-2xl font-bold text-gray-800">
                          {reportData.total}
                        </div>
                        <div className="text-sm text-gray-600">Total</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-6 flex justify-center space-x-6">
                  {reportData.pieData.map((item) => (
                    <div key={item.name} className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department Performance */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Department Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                          ? (
                              (deptApproved / deptSubmissions.length) *
                              100
                            ).toFixed(1)
                          : 0;

                      return (
                        <div
                          key={dept}
                          className="bg-white border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center mb-2">
                            {getDepartmentIcon(dept)}
                            <h4 className="ml-2 font-medium text-gray-800">
                              {dept}
                            </h4>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {deptRate}%
                          </div>
                          <div className="text-sm text-gray-600">
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
              </div>
            </div>
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
