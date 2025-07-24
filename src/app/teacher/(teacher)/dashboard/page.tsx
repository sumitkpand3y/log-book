"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  Stethoscope,
  Menu,
  X,
} from "lucide-react";
import { toast } from 'react-toastify';
import { useRouter } from "next/navigation";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useDashboardStats } from "@/hooks/useDashboardStats";

import { DashboardTab } from "@/components/dashboard/DashboardTab";
import { SubmissionsTab } from "@/components/submissions/SubmissionsTab";
import { LogBookModal } from "@/components/common/LogBookModal";

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
  const [activeTab, setActiveTab] = useState("submissions");
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
    submission.cases = submission.cases.filter((item:any)=> item.status !== "APPROVED")
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
        toast.success("Submission approved successfully!");
        refetchStats();
      } else {
        toast.error("Failed to approve submission. Please try again.");
      }
    } catch (error) {
      console.error("Error approving submission:", error);
      toast.error("Error approving submission. Please try again.");
    }
  };

  const handleRejectCase = async () => {
    if (!rejectComment.trim()) {
      toast.error("Please provide a reason for rejection");
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
        toast.success("Submission rejected. Student will be notified for corrections.");
        refetchStats();
      } else {
        toast.error("Failed to reject submission. Please try again.");
      }
    } catch (error) {
      console.error("Error rejecting submission:", error);
      toast.error("Error rejecting submission. Please try again.");
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
        toast.success(
          `${selectedSubmissionIds.length} submissions approved successfully!`
        );
        setSelectedSubmissionIds([]);
        refetchStats();
      } else {
        toast.error("Failed to bulk approve submissions. Please try again.");
      }
    } catch (error) {
      console.error("Error bulk approving submissions:", error);
      toast.error("Error bulk approving submissions. Please try again.");
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
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-1 py-2">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <DashboardTab
            stats={stats}
            submissions={submissions}
            setActiveTab={setActiveTab}
          />
        )}

        {/* Submissions Tab */}
        {activeTab === "submissions" && (
          <SubmissionsTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            filteredSubmissions={filteredSubmissions}
            handleOpenLogBook={handleOpenLogBook}
            handleBulkApprove={handleBulkApprove}
            selectedSubmissionIds={selectedSubmissionIds}
            router={router}
          />
        )}
      </div>

      {/* Log Book Modal */}
      <LogBookModal
        showLogModal={showLogModal}
        setShowLogModal={setShowLogModal}
        selectedSubmission={selectedSubmission}
        currentCaseIndex={currentCaseIndex}
        setCurrentCaseIndex={setCurrentCaseIndex}
        rejectComment={rejectComment}
        setRejectComment={setRejectComment}
        handleApproveCase={handleApproveCase}
        handleRejectCase={handleRejectCase}
      />
    </div>
  );
};

export default TeacherDashboard;