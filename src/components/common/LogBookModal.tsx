import {
  Stethoscope,
  XCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  User,
  Activity,
  Heart,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

interface LogBookModalProps {
  showLogModal: boolean;
  setShowLogModal: (show: boolean) => void;
  selectedSubmission: any;
  currentCaseIndex: number;
  setCurrentCaseIndex: (index: number) => void;
  rejectComment: string;
  setRejectComment: (comment: string) => void;
  handleApproveCase: () => void;
  handleRejectCase: () => void;
}

export const LogBookModal = ({
  showLogModal,
  setShowLogModal,
  selectedSubmission,
  currentCaseIndex,
  setCurrentCaseIndex,
  rejectComment,
  setRejectComment,
  handleApproveCase,
  handleRejectCase,
}: LogBookModalProps) => {
  if (!showLogModal || !selectedSubmission) return null;

  const handlePreviousCase = () => {
    if (currentCaseIndex > 0) {
      setCurrentCaseIndex(currentCaseIndex - 1);
    }
  };

  const handleNextCase = () => {
    if (currentCaseIndex < selectedSubmission.cases.length - 1) {
      setCurrentCaseIndex(currentCaseIndex + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
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
                Case {currentCaseIndex + 1} of {selectedSubmission.cases.length}
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
                              {selectedSubmission.cases[currentCaseIndex].caseNo}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <p className="font-semibold">
                              {selectedSubmission.cases[currentCaseIndex].date}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Age:</span>
                            <p className="font-semibold">
                              {selectedSubmission.cases[currentCaseIndex].age}{" "}
                              years
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Gender:</span>
                            <p className="font-semibold">
                              {selectedSubmission.cases[currentCaseIndex].sex}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-600">UHID:</span>
                            <p className="font-semibold">
                              {selectedSubmission.cases[currentCaseIndex].uhid}
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
                        {selectedSubmission.cases[currentCaseIndex].diagnosis}
                      </p>
                    </div>

                    <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
                      <h4 className="font-bold text-teal-800 mb-2 flex items-center">
                        <Heart className="w-5 h-5 mr-2" />
                        Management
                      </h4>
                      <p className="text-sm text-gray-700">
                        {selectedSubmission.cases[currentCaseIndex].management}
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
  );
};