import { useRouter } from "next/navigation";
import { SubmissionCard } from "./SubmissionCard";
import { getStatusColor, getPriorityColor } from "./utils";
import { User, Calendar, Clock, CheckCircle, XCircle, FileText, Eye } from "lucide-react";

interface SubmissionTableProps {
  filteredSubmissions: any[];
  handleOpenLogBook: (submission: any) => void;
  handleBulkApprove: () => void;
  selectedSubmissionIds: string[];
  router: ReturnType<typeof useRouter>;
}

export const SubmissionTable = ({
  filteredSubmissions,
  handleOpenLogBook,
  handleBulkApprove,
  selectedSubmissionIds,
  router,
}: SubmissionTableProps) => (
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
                      {/* {getDepartmentIcon(submission.department)} */}
                      <span className="ml-1">{submission.department}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-start">
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
                    onClick={() =>
                      router.push(
                        `/teacher/dashboard/new?learnerId=${submission.learnerId}&submissionId=${submission.id}`
                      )
                    }
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