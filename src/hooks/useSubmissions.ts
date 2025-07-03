import { submissionAPI } from "@/services/submission.services";
import { useEffect, useState } from "react";

// Define or import the SubmissionData type
export interface SubmissionData {
  id: string;
  status: string;
  comments?: string;
  // Add other fields as needed
}

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await submissionAPI.getAllSubmissions();
      setSubmissions(response.data.submissions || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };
  const fetchCasesByUserID = async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await submissionAPI.getAllCasesByUserId(userId);

      // ✅ Safely access submissions array from response
      const cases = response?.data?.cases || [];
      setCases(cases);
    } catch (err) {
      console.error("❌ Error fetching submissions:", err);
      setError("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

//   return {
//     submissions,
//     loading,
//     error,
//     fetchCasesByUserID,
//   };

  const approveSubmission = async (id: string, comments?: string) => {
    try {
      await submissionAPI.approveSubmission(id, { comments });
      // Update local state
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === id ? { ...sub, status: "Approved", comments } : sub
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
      // Update local state
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
      return true;
    } catch (error) {
      console.error("Failed to reject submission:", error);
      return false;
    }
  };

  const bulkApprove = async (submissionIds: string[], comments?: string) => {
    try {
      await submissionAPI.bulkApproveSubmissions({ submissionIds, comments });
      // Update local state
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

  return {
    submissions,
    cases,
    loading,
    error,
    refetch: fetchSubmissions,
    approveSubmission,
    rejectSubmission,
    fetchCasesByUserID,
    bulkApprove,
  };
}
