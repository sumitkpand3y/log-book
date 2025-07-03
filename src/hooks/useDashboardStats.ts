import { submissionAPI } from "@/services/submission.services";
import { useEffect, useState } from "react";

export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await submissionAPI.getDashboardStats();
      setStats(response.data || {});
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
