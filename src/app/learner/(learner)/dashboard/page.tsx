"use client";
import { useState, useEffect } from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Stethoscope,
} from "lucide-react";
import CourseCards from "./CourseCards";
import { useCourses } from "@/hooks/useCourses";
import { useTasks } from "@/hooks/useTasks";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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

// Main Dashboard Component
export default function Dashboard() {
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
  });
  
  // Hooks
  const {
    courses,
    loading: loadingCourses,
    refetch: refetchCourses,
  } = useCourses();

  const {
    tasks,
    loading: loadingTasks,
    error,
    refetch: refetchTasks,
  } = useTasks(filters);

  // Effects
  useEffect(() => {
    refetchTasks();
    refetchCourses();
  }, []);

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

  const stats = getTaskStats();

  // Data for charts
  const barChartData = [
    { name: "Submitted", value: stats.submitted },
    { name: "Approved", value: stats.approved },
    { name: "Rejected", value: stats.rejected },
    { name: "Resubmitted", value: stats.resubmitted },
    { name: "Draft", value: stats.draft },
  ];

  const pieChartData = [
    { name: "Submitted", value: stats.submitted },
    { name: "Approved", value: stats.approved },
    { name: "Rejected", value: stats.rejected },
    { name: "Resubmitted", value: stats.resubmitted },
    { name: "Draft", value: stats.draft },
  ];

  const COLORS = ["#FFA500", "#10B981", "#EF4444", "#3B82F6", "#6B7280"];

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
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="space-y-6 sm:space-y-8">
          {/* Course Cards */}
          <div className="w-full">
            <CourseCards courses={courses ?? []} />
          </div>

          {/* Task Statistics */}
          <div className="w-full">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Case Statistics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-4 sm:gap-6">
              {statCards.map((card, index) => (
                <StatCard
                  key={index}
                  title={card.title}
                  value={card.value}
                  color={card.color}
                  icon={card.icon}
                  borderColor={card.borderColor}
                />
              ))}
            </div>
          </div>

          {/* Data Visualization Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Bar Chart */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
              <h3 className="text-md sm:text-lg font-semibold text-gray-900 mb-4">
                Case Status Distribution
              </h3>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barChartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Number of Cases">
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
              <h3 className="text-md sm:text-lg font-semibold text-gray-900 mb-4">
                Case Status Proportion
              </h3>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

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
                    There was an issue loading your tasks. Please try refreshing
                    the page.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}