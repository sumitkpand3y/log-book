import {
  FileText,
  BarChart3,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { formatDate, getStatusColor } from "../common/utils";
import { StatsCard } from "../common/StatsCard";
import MedicalDashboard from "@/app/teacher/(teacher)/dashboard/Dashbaord";

interface DashboardTabProps {
  stats: any;
  submissions: any[];
  setActiveTab: (tab: string) => void;
}

export const DashboardTab = ({
  stats,
  submissions,
  setActiveTab,
}: DashboardTabProps) => {
  return (
    <div className="space-y-3">
      <MedicalDashboard
        submissions={submissions}
        stats={stats}
        // getDepartmentIcon={getDepartmentIcon}
      />

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
              {stats?.recentActivity?.map((entry: any) => (
                <tr key={entry.id} className="hover:bg-blue-50 transition-colors">
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
        </div>
      </div>
    </div>
  );
};