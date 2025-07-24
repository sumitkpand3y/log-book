import { apiFetch } from "@/utils/apiFetch";

interface SubmissionData {
  id: string;
  title: string;
  description?: string;
  status: "Pending" | "Approved" | "Rejected";
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
  attachments?: string[];
}

interface BulkApprovalData {
  submissionIds: string[];
  comments?: string;
}

interface ApprovalData {
  comments?: string;
}

interface RejectionData {
  teacherComments: string;
  rejectionReason?: string;
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

export const submissionAPI = {
  // Get all submissions for teacher with filters
  async getAllSubmissions(filters?: SubmissionFilters) {
    try {
      return await apiFetch.get("/submissions", {
        params: filters,
        cache: true,
        cacheTTL: 2 * 60 * 1000, // 2 minutes cache
      });
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      return { data: { submissions: [] } };
    }
  },

  // Get dashboard statistics with optional filters
  async getDashboardStats(filters?: Pick<SubmissionFilters, 'startDate' | 'endDate'>) {
    try {
      return await apiFetch.get("/submissions/stats", {
        params: filters,
        cache: true,
        cacheTTL: 5 * 60 * 1000, // 5 minutes cache
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      return { data: { stats: {} } };
    }
  },

  // Export submissions data with filters
  async exportSubmissions(filters?: Omit<SubmissionFilters, 'page' | 'limit'>) {
    try {
      return await apiFetch.get("/submissions/export", {
        params: filters,
        responseType: 'blob', // For file downloads
      });
    } catch (error) {
      console.error("Failed to export submissions:", error);
      throw error;
    }
  },

  // Get single submission by ID
  async getSubmissionById(id: string) {
    try {
      return await apiFetch.get(`/submissions/${id}`, {
        cache: true,
        cacheTTL: 3 * 60 * 1000, // 3 minutes cache
      });
    } catch (error) {
      console.error(`Failed to fetch submission with ID ${id}:`, error);
      return null;
    }
  },

  // Get all cases by user ID with optional filters
  async getAllCasesByUserId(userId: string, filters?: Omit<SubmissionFilters, 'search' | 'page' | 'limit'>) {
    try {
      return await apiFetch.get(`/submissions/user/${userId}`, {
        params: filters,
        cache: true,
        cacheTTL: 3 * 60 * 1000, // 3 minutes cache
      });
    } catch (error) {
      console.error(`Failed to fetch submission with ID ${userId}:`, error);
      return null;
    }
  },

  // Approve a submission
  async approveSubmission(id: string, data: ApprovalData) {
    try {
      return await apiFetch.put(`/submissions/${id}/approve`, data);
    } catch (error) {
      console.error(`Failed to approve submission ${id}:`, error);
      throw error;
    }
  },

  // Reject a submission
  async rejectSubmission(id: string, data: RejectionData) {
    try {
      return await apiFetch.put(`/submissions/${id}/reject`, data);
    } catch (error) {
      console.error(`Failed to reject submission ${id}:`, error);
      throw error;
    }
  },

  // Bulk approve submissions
  async bulkApproveSubmissions(data: BulkApprovalData) {
    try {
      return await apiFetch.post("/submissions/bulk-approve", data);
    } catch (error) {
      console.error("Failed to bulk approve submissions:", error);
      throw error;
    }
  },
};