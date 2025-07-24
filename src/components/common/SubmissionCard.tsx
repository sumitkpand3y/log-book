import { Calendar, FileText, Eye, User, CheckCircle, Clock, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { getStatusColor } from "./utils";

interface SubmissionCardProps {
  submission: any;
  handleOpenLogBook: (submission: any) => void;
  router: ReturnType<typeof useRouter>;
}

export const SubmissionCard = ({
  submission,
  handleOpenLogBook,
  router,
}: SubmissionCardProps) => (
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
            {/* {getDepartmentIcon(submission.department)} */}
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