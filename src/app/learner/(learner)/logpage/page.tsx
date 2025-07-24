"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Calendar,
  PieChart,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Stethoscope,
  Menu,
  X,
  List,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import CalendarView from "../dashboard/CalendarView";
import CourseCards from "../dashboard/CourseCards";
import { useRouter } from "next/navigation";
import { useCourses } from "@/hooks/useCourses";
import { useTasks } from "@/hooks/useTasks";
import ListView from "../dashboard/ListView";

// Type definitions
interface Task {
  id: string;
  caseNo: string;
  patientId?: string;
  date: string;
  age: number;
  sex: "MALE" | "FEMALE" | "OTHERS";
  uhid: string;
  chiefComplaint: string;
  historyPresenting: string;
  pastHistory: string;
  personalHistory?: string;
  familyHistory?: string;
  clinicalExamination: string;
  labExaminations: string;
  diagnosis: string;
  management: string;
  status: "DRAFT" | "SUBMITED" | "APPROVED" | "REJECTED" | "RESUBMITTED";
  rejectionReason?: string;
  courseId?: string;
  createdBy: string;
  department: string;
  lastModified: string;
}

interface Course {
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
  status: "Not Started" | "Allocated" | "Started" | "Completed";
}


interface TaskStats {
  submitted: number;
  approved: number;
  rejected: number;
  resubmitted: number;
  draft: number;
}

interface StatCardProps {
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  borderColor: string;
}

// Stat Card Component
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  color,
  icon,
  borderColor,
}) => (
  <div
    className={`bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 ${borderColor} hover:shadow-lg transition-shadow duration-200`}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className={`${color} text-xs sm:text-sm font-medium mb-1`}>
          {title}
        </p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="flex-shrink-0 ml-3">
        <div className="w-6 h-6 sm:w-8 sm:h-8">{icon}</div>
      </div>
    </div>
  </div>
);

// Loading Component
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div className="text-center bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-sm w-full">
      <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
      <p className="text-gray-600 font-medium text-sm sm:text-base">
        Loading Medical Dashboard...
      </p>
    </div>
  </div>
);

// Header Component
interface HeaderProps {
  activeView: "list" | "calendar";
  setActiveView: (view: "list" | "calendar") => void;
  onAddCase: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onAddCase,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => (
  <div className="mb-6 sm:mb-8">
    <div className="flex flex-col lg:flex-row lg:justify-center gap-2 lg:gap-2">
      {/* Desktop Navigation */}
      <div className="hidden sm:flex gap-3">
        <button
          onClick={() => setActiveView("calendar")}
          className={`px-4 lg:px-6 py-2 rounded-lg font-medium transition-all ${
            activeView === "calendar"
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-white text-gray-600 hover:bg-gray-50 border"
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Calendar
        </button>
        <button
          onClick={() => setActiveView("list")}
          className={`px-4 lg:px-6 py-2 rounded-lg font-medium transition-all ${
            activeView === "list"
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-white text-gray-600 hover:bg-gray-50 border"
          }`}
        >
          <List className="w-4 h-4 inline mr-2" />
          List
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="sm:hidden p-2 rounded-lg bg-white border shadow-sm"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5 text-gray-600" />
        ) : (
          <Menu className="w-5 h-5 text-gray-600" />
        )}
      </button>
    </div>

    {/* Mobile Navigation */}
    {isMobileMenuOpen && (
      <div className="sm:hidden mt-4 p-4 bg-white rounded-lg shadow-md border">
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              setActiveView("calendar");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-all text-left ${
              activeView === "calendar"
                ? "bg-blue-600 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Calendar
          </button>
          <button
            onClick={() => {
              setActiveView("list");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-all  text-left ${
              activeView === "list"
                ? "bg-blue-600 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            List
          </button>
        </div>
      </div>
    )}
  </div>
);

// Main Dashboard Component
export default function Dashboard() {
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
    courseId: "",
  });

  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");

  const {
    courses,
    loading: loadingCourses,
    refetch: refetchCourses,
  } = useCourses();

  const {
    tasks,
    loading: loadingTasks,
    error,
    pagination,
    goToPage,
    nextPage,
    previousPage,
    changeItemsPerPage,
    refetch: refetchTasks,
  } = useTasks({ ...filters, courseId });
  const router = useRouter();

  console.log("tasks", tasks);
  

  // State
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeView, setActiveView] = useState<"list" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Effects
  useEffect(() => {
    if(courseId){
      console.log("courseId", courseId);
      
    refetchTasks();
    refetchCourses();
    }
  }, [courseId]);

  console.log("courseId", courseId);
  

  // Handlers
  const handleDateClick = (date: string) => {
    const existingTask = tasks.find((task) => task.id === date);
    if (existingTask) {
      router.push(
        "/learner/dashboard/task/edit?idd=" +
          courseId +
          "&&id=" +
          existingTask.id
      );
      setEditingTask(existingTask);
    } else {
      router.push("/learner/dashboard/task/new?idd=" + courseId);
      setSelectedDate(date);
    }
  };

  const handleAddCase = () => {
    setEditingTask(null);
    setSelectedDate("");
    router.push("/learner/dashboard/task/new");
  };

  // Computed values
  const getTaskStats = (): TaskStats => {
    return {
      submitted: tasks.filter((t) => t.status === "SUBMITTED").length,
      approved: tasks.filter((t) => t.status === "APPROVED").length,
      rejected: tasks.filter((t) => t.status === "REJECTED").length,
      resubmitted: tasks.filter((t) => t.status === "RESUBMITTED").length,
      draft: tasks.filter((t) => t.status === "DRAFT").length,
    };
  };

  //  const handleDateClick = useCallback((taskId) => {
  //   // Navigate to edit page or open modal
  // }, []);

  const handleSearch = useCallback((searchTerm) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
  }, []);

  const handleStatusFilter = useCallback((status) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const handleItemsPerPageChange = useCallback(
    (itemsPerPage) => {
      changeItemsPerPage(itemsPerPage);
    },
    [changeItemsPerPage]
  );

  const stats = getTaskStats();

  // Stat card configurations
  const statCards = [
    {
      title: "Submitted",
      value: stats.submitted,
      color: "text-orange-600",
      borderColor: "border-orange-500",
      icon: <Clock className="w-full h-full text-orange-500" />,
    },
    {
      title: "Approved",
      value: stats.approved,
      color: "text-green-600",
      borderColor: "border-green-500",
      icon: <CheckCircle className="w-full h-full text-green-500" />,
    },
    {
      title: "Rejected",
      value: stats.rejected,
      color: "text-red-600",
      borderColor: "border-red-500",
      icon: <XCircle className="w-full h-full text-red-500" />,
    },
    {
      title: "Resubmitted",
      value: stats.resubmitted,
      color: "text-blue-600",
      borderColor: "border-blue-500",
      icon: <RotateCcw className="w-full h-full text-blue-500" />,
    },
    {
      title: "Draft",
      value: stats.draft,
      color: "text-gray-600",
      borderColor: "border-gray-500",
      icon: <FileText className="w-full h-full text-gray-500" />,
    },
  ];
  // Loading state
  if (loadingCourses || loadingTasks) {
  // if (loadingCourses ) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen ">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 ">
        {/* Header */}
        <Header
          activeView={activeView}
          setActiveView={setActiveView}
          onAddCase={handleAddCase}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Main Content */}
        {activeView === "calendar" ? (
          <div className="space-y-6 sm:space-y-8">
            <CalendarView
              courseId={courseId}
              tasksList={tasks}
              onDateClick={handleDateClick}
            />

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <XCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">
                      Error Loading Data
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      There was an issue loading your tasks. Please try
                      refreshing the page.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full">
            <ListView
              courseId={courseId}
              tasksList={tasks}
              onDateClick={handleDateClick}
              loading={loadingTasks}
              error={error}
              pagination={pagination}
              onPageChange={goToPage}
              onNextPage={nextPage}
              onPreviousPage={previousPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              onSearch={handleSearch}
              onStatusFilter={handleStatusFilter}
            />
          </div>
        )}
      </div>
    </div>
  );
}
