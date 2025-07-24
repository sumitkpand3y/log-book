import { submissionAPI } from "@/services/submission.services";
import { useEffect, useState } from "react";

export interface SubmissionData {
  id: string;
  status: string;
  learnerName: string;
  learnerId: string;
  taskTitle: string;
  submissionDate: string;
  dueDate: string;
  department: string;
  priority: string;
  totalCases: number;
  approvedCases: number;
  rejectedCases: number;
  pendingCases: number;
  completedCases: number;
  cases: Array<{
    id: string;
    caseNo: string;
    date: string;
    status: string;
    rejectionReason?: string;
    // Add other case fields as needed
  }>;
  comments?: string;
}

interface SubmissionFilters {
  search?: string;
  status?: string;
  department?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface CaseFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  courseId?: string;
}

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchSubmissions = async (filters: SubmissionFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await submissionAPI.getAllSubmissions({
        ...filters,
        page: filters.page || pagination.page,
        limit: filters.limit || pagination.limit,
      });
      
      setSubmissions(response.data.submissions || []);
      
      // Update pagination if available in response
      if (response.data.pagination) {
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const fetchCasesByUserID = async (userId: string, filters?: CaseFilters) => {
    setLoading(true);
    setError(null);

    try {
      const response = await submissionAPI.getAllCasesByUserId(userId, filters);
      setCases(response?.data?.cases || []);
    } catch (err) {
      console.error("Error fetching cases:", err);
      setError("Failed to load cases");
    } finally {
      setLoading(false);
    }
  };

  const approveSubmission = async (id: string, comments?: string) => {
    try {
      await submissionAPI.approveSubmission(id, { comments });
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === id ? { ...sub, status: "Approved", comments } : sub
        )
      );
      // Also update individual case status if it exists in cases state
      setCases((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: "APPROVED", comments } : c
        )
      );
      return true;
    } catch (error) {
      console.error("Failed to approve submission:", error);
      return false;
    }
  };

  const rejectSubmission = async (
    id: string,
    comments: string,
    reason?: string
  ) => {
    try {
      let payload = {
        teacherComments: comments,
        rejectionReason: reason,
      };
      await submissionAPI.rejectSubmission(id, payload);
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === id
            ? {
                ...sub,
                status: "Rejected",
                teacherComments: comments,
                rejectionReason: reason,
              }
            : sub
        )
      );
      // Also update individual case status if it exists in cases state
      setCases((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: "REJECTED",
                teacherComments: comments,
                rejectionReason: reason,
              }
            : c
        )
      );
      return true;
    } catch (error) {
      console.error("Failed to reject submission:", error);
      return false;
    }
  };

  const bulkApprove = async (submissionIds: string[], comments?: string) => {
    try {
      await submissionAPI.bulkApproveSubmissions({ submissionIds, comments });
      setSubmissions((prev) =>
        prev.map((sub) =>
          submissionIds.includes(sub.id)
            ? { ...sub, status: "Approved", comments }
            : sub
        )
      );
      return true;
    } catch (error) {
      console.error("Failed to bulk approve submissions:", error);
      return false;
    }
  };

  // Add pagination controls
  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    fetchSubmissions({ page });
  };

  const changeLimit = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
    fetchSubmissions({ limit, page: 1 });
  };

  return {
    submissions,
    cases,
    loading,
    error,
    pagination,
    fetchSubmissions,
    refetch: fetchSubmissions,
    approveSubmission,
    rejectSubmission,
    fetchCasesByUserID,
    bulkApprove,
    goToPage,
    changeLimit,
  };
}