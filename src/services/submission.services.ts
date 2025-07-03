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

export const submissionAPI = {
  // Get all submissions for teacher
  async getAllSubmissions() {
    try {
      return await apiFetch.get("/submissions", {
        cache: true,
        cacheTTL: 2 * 60 * 1000, // 2 minutes cache
      });
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      return { data: { submissions: [] } };
    }
  },

  // Get dashboard statistics
  async getDashboardStats() {
    try {
      return await apiFetch.get("/submissions/stats", {
        cache: true,
        cacheTTL: 5 * 60 * 1000, // 5 minutes cache
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      return { data: { stats: {} } };
    }
  },

  // Export submissions data
  async exportSubmissions() {
    try {
      return await apiFetch.get("/submissions/export", {
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
  // Get single submission by ID
  async getAllCasesByUserId(userId: string) {
    try {
      return await apiFetch.get(`/submissions/user/${userId}`, {
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