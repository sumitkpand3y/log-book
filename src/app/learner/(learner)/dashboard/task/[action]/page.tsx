"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTasks } from "@/hooks/useTasks";
import { useCourses } from "@/hooks/useCourses";
import {
  Save,
  Send,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader,
  User,
  FileText,
  Stethoscope,
  ArrowLeft,
} from "lucide-react";
import React from "react";

// ---------- Type Definitions ----------
interface Task {
  id: string;
  date: string;
  age: number;
  sex: "MALE" | "FEMALE" | "OTHER";
  uhid: string;
  chiefComplaint: string;
  historyPresenting: string;
  pastHistory: string;
  personalHistory: string;
  familyHistory: string;
  clinicalExamination: string;
  labExaminations: string;
  diagnosis: string;
  management: string;
  status: "DRAFT" | "SUBMITTED" | "Approved" | "Rejected" | "RESUBMITTED";
  rejectionReason?: string;
  courseId: string;
}

interface Course {
  title: string;
  id: string;
  name: string;
  enrollmentNumber: string;
  facultyName: string;
  designation: string;
  hospitalName: string;
  location: string;
  contactProgram: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface FormData {
  date: string;
  age: number;
  sex: "MALE" | "FEMALE" | "OTHER";
  uhid: string;
  chiefComplaint: string;
  historyPresenting: string;
  pastHistory: string;
  personalHistory: string;
  familyHistory: string;
  clinicalExamination: string;
  labExaminations: string;
  diagnosis: string;
  management: string;
  courseId: string;
}

interface TaskPageProps {
  params: Promise<{ idd: string; action: string }>;
}

// ---------- Utility Components ----------
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-sm w-full mx-4">
      <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
      <p className="text-gray-600 font-medium text-sm sm:text-base">
        Loading Task Form...
      </p>
    </div>
  </div>
);

const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Error Loading Data
      </h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  </div>
);

// ---------- Form Section Components ----------
const FormSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  bgColor: string;
  children: React.ReactNode;
}> = ({ title, icon, bgColor, children }) => (
  <div className={`${bgColor} rounded-lg p-4 sm:p-6`}>
    <div className="flex items-center mb-4">
      <div className="w-5 h-5 mr-2">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
);

const InputField: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}> = ({ label, required, error, children }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-red-500 text-sm mt-1 flex items-center">
        <AlertCircle className="w-3 h-3 mr-1" />
        {error}
      </p>
    )}
  </div>
);

const TextAreaField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required,
  error,
  disabled,
}) => (
  <InputField label={label} required={required} error={error}>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
        error ? "border-red-500" : "border-gray-300"
      } ${disabled ? "bg-gray-50" : ""}`}
      placeholder={placeholder}
      disabled={disabled}
    />
  </InputField>
);

// ---------- Main Component ----------
export default function TaskPage({ params }: TaskPageProps) {
  // Hooks
  const {
    tasks,
    createTask,
    updateTask,
    getTaskById,
    loading: tasksLoading,
    error: tasksError,
  } = useTasks();
  const {
    courses,
    loading: loadingCourses,
    error,
    refetch: refetchCourses,
  } = useCourses();
  const { idd, action } = React.use(params);

  const searchParams = useSearchParams();
  const router = useRouter();

  // URL parameters
  const taskId = searchParams.get("id");
  const courseId = searchParams.get("idd");
  const course = courses.find((item) => item.id == courseId);
  const courseName = course ? course.name : "Unknown";

  const selectedDate = searchParams.get("date") || undefined;

  // State management
  const [task, setTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ---------- Form Initialization ----------
  const initializeFormData = (courses: Course[]): FormData => ({
    date: selectedDate || new Date().toISOString().split("T")[0],
    age: 0,
    sex: "MALE",
    uhid: "",
    chiefComplaint: "",
    historyPresenting: "",
    pastHistory: "",
    personalHistory: "",
    familyHistory: "",
    clinicalExamination: "",
    labExaminations: "",
    diagnosis: "",
    management: "",
    courseId: courseId || "",
  });

  // ---------- Data Fetching ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Ensure courses are loaded
        if (courses.length === 0) {
          await refetchCourses();
        }
        const courseList = courses.length ? courses : [];

        if (action === "edit" && taskId) {
          try {
            const taskData = await getTaskById(taskId);
            if (taskData.data) {
              setTask(taskData.data);
              setFormData({
                ...taskData.data,
                date: taskData.data.date
                  ? new Date(taskData.data.date).toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0],
              });
            } else {
              console.warn(`Task with ID ${taskId} not found`);
              setFormData(initializeFormData(courseList));
            }
          } catch (error) {
            console.error("Error fetching task:", error);
            setFormData(initializeFormData(courseList));
          }
        } else {
          setFormData(initializeFormData(courseList));
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId, action, selectedDate, courses]);

  // ---------- Form Validation ----------
  const validateForm = (): boolean => {
    if (!formData) return false;

    const newErrors: Record<string, string> = {};

    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.age || formData.age <= 0)
      newErrors.age = "Valid age required";
    if (!formData.uhid?.trim()) newErrors.uhid = "UHID is required";
    if (!formData.chiefComplaint?.trim())
      newErrors.chiefComplaint = "Chief Complaint required";
    if (!formData.courseId) newErrors.courseId = "Course is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------- Form Handlers ----------
  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const handleSave = async (isDraft: boolean) => {
    if (!formData) return;
    if (!isDraft && !validateForm()) return;

    setSubmitting(true);

    try {
      const taskData = {
        ...formData,
        status: isDraft ? "DRAFT" : "SUBMITTED",
        rejectionReason: task?.rejectionReason,
      };

      let result;
      if (action === "edit" && taskId) {
        result = await updateTask(taskId, taskData);
      } else {
        result = await createTask(taskData);
      }

      if (result) {
        router.back();
      }
    } catch (err) {
      console.error(`Failed to ${isDraft ? "save" : "submit"} task:`, err);
    } finally {
      setSubmitting(false);
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    if (!formData) return;
    const current = new Date(formData.date);
    current.setDate(current.getDate() + (direction === "next" ? 1 : -1));
    updateFormData({ date: current.toISOString().split("T")[0] });
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? Any unsaved changes will be lost."
      )
    ) {
      router.back();
    }
  };

  // ---------- Render States ----------
  if (loading || loadingCourses || !formData) {
    return <LoadingSpinner />;
  }

  if (tasksError) {
    return (
      <ErrorMessage
        message={`Error loading tasks: ${tasksError.message}`}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // ---------- Main Render ----------
  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-0 sm:py-2">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {action === "edit" ? "Edit Case Log" : "New Case Log"} {" - "}
                  {courseName}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {action === "edit"
                    ? "Update existing case details"
                    : "Create a new medical case log"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Form Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="space-y-6 sm:space-y-8">
              {/* Basic Information */}
              <FormSection
                title="Basic Information"
                icon={<FileText className="w-5 h-5 text-blue-600" />}
                bgColor="bg-blue-50"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

                  <InputField label="Date" required error={errors.date}>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => navigateDate("prev")}
                        className="p-2 sm:p-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        disabled={submitting}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          updateFormData({ date: e.target.value })
                        }
                        className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.date ? "border-red-500" : "border-gray-300"
                        }`}
                        disabled={submitting}
                      />
                      <button
                        type="button"
                        onClick={() => navigateDate("next")}
                        className="p-2 sm:p-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        disabled={submitting}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </InputField>

                  <InputField label="UHID" required error={errors.uhid}>
                    <input
                      type="text"
                      value={formData.uhid}
                      onChange={(e) => updateFormData({ uhid: e.target.value })}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.uhid ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter UHID"
                      disabled={submitting}
                    />
                  </InputField>
                </div>
              </FormSection>

              {/* Patient Demographics */}
              <FormSection
                title="Patient Demographics"
                icon={<User className="w-5 h-5 text-green-600" />}
                bgColor="bg-green-50"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <InputField label="Age" required error={errors.age}>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) =>
                        updateFormData({ age: parseFloat(e.target.value) || 0 })
                      }
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.age ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter age"
                      step="0.1"
                      min="0"
                      disabled={submitting}
                    />
                  </InputField>

                  <InputField label="Sex" required>
                    <div className="flex flex-wrap gap-4 pt-2">
                      {["MALE", "FEMALE", "OTHER"].map((option) => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="sex"
                            value={option}
                            checked={formData.sex === option}
                            onChange={(e) =>
                              updateFormData({ sex: e.target.value as any })
                            }
                            className="mr-2 text-blue-600"
                            disabled={submitting}
                          />
                          <span className="text-sm text-gray-700">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </InputField>
                </div>
              </FormSection>

              {/* Clinical Information */}
              <FormSection
                title="Clinical Information"
                icon={<Stethoscope className="w-5 h-5 text-purple-600" />}
                bgColor="bg-purple-50"
              >
                <div className="space-y-4 sm:space-y-6">
                  <TextAreaField
                    label="Chief Complaint"
                    value={formData.chiefComplaint}
                    onChange={(value) =>
                      updateFormData({ chiefComplaint: value })
                    }
                    placeholder="Enter chief complaint"
                    rows={3}
                    required
                    error={errors.chiefComplaint}
                    disabled={submitting}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <TextAreaField
                      label="History of Presenting Illness"
                      value={formData.historyPresenting}
                      onChange={(value) =>
                        updateFormData({ historyPresenting: value })
                      }
                      placeholder="Enter detailed history of presenting illness"
                      disabled={submitting}
                    />

                    <TextAreaField
                      label="Past Medical and Surgical History"
                      value={formData.pastHistory}
                      onChange={(value) =>
                        updateFormData({ pastHistory: value })
                      }
                      placeholder="Enter past medical and surgical history"
                      disabled={submitting}
                    />

                    <TextAreaField
                      label="Personal History"
                      value={formData.personalHistory}
                      onChange={(value) =>
                        updateFormData({ personalHistory: value })
                      }
                      placeholder="Enter personal history (smoking, alcohol, etc.)"
                      disabled={submitting}
                    />

                    <TextAreaField
                      label="Family History"
                      value={formData.familyHistory}
                      onChange={(value) =>
                        updateFormData({ familyHistory: value })
                      }
                      placeholder="Enter family history"
                      disabled={submitting}
                    />

                    <TextAreaField
                      label="Clinical Examination"
                      value={formData.clinicalExamination}
                      onChange={(value) =>
                        updateFormData({ clinicalExamination: value })
                      }
                      placeholder="Enter clinical examination findings"
                      disabled={submitting}
                    />

                    <TextAreaField
                      label="Laboratory Examinations"
                      value={formData.labExaminations}
                      onChange={(value) =>
                        updateFormData({ labExaminations: value })
                      }
                      placeholder="Enter laboratory examination results"
                      disabled={submitting}
                    />

                    <TextAreaField
                      label="Diagnosis"
                      value={formData.diagnosis}
                      onChange={(value) => updateFormData({ diagnosis: value })}
                      placeholder="Enter diagnosis"
                      disabled={submitting}
                    />

                    <TextAreaField
                      label="Management"
                      value={formData.management}
                      onChange={(value) =>
                        updateFormData({ management: value })
                      }
                      placeholder="Enter management plan"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </FormSection>

              {/* Rejection Reason */}
              {task?.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-800 mb-2">
                        Rejection Reason:
                      </h4>
                      <p className="text-sm text-red-700">
                        {task.rejectionReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
              <button
                onClick={handleCancel}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>

              <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => handleSave(true)}
                  disabled={submitting}
                  className="w-full sm:w-auto bg-gray-700 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center justify-center hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {submitting ? "Saving..." : "Save as Draft"}
                </button>

                <button
                  onClick={() => handleSave(false)}
                  disabled={submitting}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center justify-center hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
