"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Stethoscope,
  XCircle,
  X,
} from "lucide-react";

// Types
interface Task {
  id: string;
  caseNo: string;
  date: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "RESUBMITTED";
  courseId: string;
  patientId?: string;
  age?: number;
  sex?: string;
  uhid?: string;
  chiefComplaint?: string;
  historyPresenting?: string;
  pastHistory?: string;
  clinicalExamination?: string;
  labExaminations?: string;
  diagnosis?: string;
  management?: string;
  department?: string;
  createdBy?: string;
  lastModified?: string;
}

interface CalendarViewProps {
  tasksList: Task[];
  onDateClick: (date: string) => void;
  tasks?: Task[];
  loading?: boolean;
  error?: string;
  refetch?: () => void;
}

// Constants
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Utility functions
const getStatusColor = (status: string): string => {
  const colors = {
    APPROVED: "bg-green-500",
    SUBMITTED: "bg-orange-500",
    REJECTED: "bg-red-500",
    RESUBMITTED: "bg-blue-500",
    DRAFT: "bg-gray-500",
  };
  return colors[status as keyof typeof colors] || "bg-gray-300";
};

const getTableStatusColor = (status: string): string => {
  const colors = {
    APPROVED: "bg-green-100 text-green-800 border-green-300",
    DRAFT: "bg-yellow-100 text-yellow-800 border-yellow-300",
    REJECTED: "bg-red-100 text-red-800 border-red-300",
    SUBMITTED: "bg-orange-100 text-orange-800 border-orange-300",
    RESUBMITTED: "bg-blue-100 text-blue-800 border-blue-300",
  };
  return (
    colors[status as keyof typeof colors] ||
    "bg-gray-100 text-gray-800 border-gray-300"
  );
};

const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }
  return days;
};

const CalendarGrid = ({
  currentDate,
  tasks,
  onDayClick,
}: {
  currentDate: Date;
  tasks: Task[];
  onDayClick: (day: Date, dayTasks: Task[]) => void;
}) => {
  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  const getTasksForDate = useCallback(
    (date: Date) => {
      const targetDate = formatDate(date);
      return tasks.filter((task) => {
        const taskDate = task.date.split("T")[0];
        return taskDate === targetDate;
      });
    },
    [tasks]
  );

  return (
    <div className="grid grid-cols-7 gap-1 sm:gap-2">
      {WEEK_DAYS.map((day) => (
        <div
          key={day}
          className="p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-gray-500"
        >
          <span className="hidden sm:inline">{day}</span>
          <span className="sm:hidden">{day.charAt(0)}</span>
        </div>
      ))}

      {days.map((day, index) => {
        if (!day) {
          return <div key={index} className="p-2 h-16 sm:h-24"></div>;
        }

        const dayTasks = getTasksForDate(day);
        const isToday = day.toDateString() === new Date().toDateString();

        return (
          <div
            key={index}
            className={`p-1 sm:p-2 h-16 sm:h-24 border border-gray-100 hover:bg-gray-50 cursor-pointer transition-all ${
              isToday ? "bg-blue-50 border-blue-200" : ""
            }`}
            onClick={() => onDayClick(day, dayTasks)}
          >
            <div className="flex flex-col h-full">
              <span
                className={`text-xs sm:text-sm ${
                  isToday ? "font-bold text-blue-600" : "text-gray-900"
                }`}
              >
                {day.getDate()}
              </span>

              <div className="flex-1 mt-1 space-y-1">
                {dayTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-full opacity-0 hover:opacity-100 transition-opacity">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  </div>
                ) : (
                  <>
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className={`w-full h-1 sm:h-2 rounded-full ${getStatusColor(
                          task.status
                        )}`}
                        title={`${task.caseNo} - ${task.status}`}
                      />
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayTasks.length - 2}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DayModal = ({
  selectedDay,
  tasksForDay,
  onClose,
  onTaskClick,
  onAddTask,
}: {
  selectedDay: Date | null;
  tasksForDay: Task[];
  onClose: () => void;
  onTaskClick: (taskId: string) => void;
  onAddTask: (date: Date) => void;
}) => {
  if (!selectedDay) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg shadow-2xl border border-blue-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-blue-800">
              {selectedDay.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h2>
            <p className="text-xs text-gray-500">
              Tap a task to edit or add new
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition p-1"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {tasksForDay.length > 0 ? (
            tasksForDay.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg cursor-pointer transition-all"
                onClick={() => onTaskClick(task.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-blue-900">
                      Case: {task.caseNo}
                    </span>
                    {task.diagnosis && (
                      <p className="text-xs text-blue-700 mt-1 truncate">
                        {task.diagnosis}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2 ${getTableStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 text-sm py-8">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No tasks for this day</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition-all"
            onClick={() => onAddTask(selectedDay)}
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
};

const StatusLegend = () => (
  <div className="mt-6 pt-4 border-t border-gray-200">
    <p className="text-sm font-medium text-gray-900 mb-2">Status Legend:</p>
    <div className="flex flex-wrap gap-2 sm:gap-4">
      {[
        { status: "APPROVED", color: "bg-green-500" },
        { status: "SUBMITTED", color: "bg-orange-500" },
        { status: "REJECTED", color: "bg-red-500" },
        { status: "RESUBMITTED", color: "bg-blue-500" },
        { status: "DRAFT", color: "bg-gray-500" },
      ].map((item) => (
        <div key={item.status} className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${item.color}`} />
          <span className="text-xs text-gray-600">{item.status}</span>
        </div>
      ))}
    </div>
  </div>
);

// Main Component
export default function CalendarView({
  tasksList,
  onDateClick,
  tasks = [],
  loading = false,
  error = null,
  refetch,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [tasksForDay, setTasksForDay] = useState<Task[]>([]);

  const allTasks = useMemo(() => {
    return [...tasksList, ...tasks];
  }, [tasksList, tasks]);

  const handleDayClick = useCallback((day: Date, dayTasks: Task[]) => {
    setSelectedDay(day);
    setTasksForDay(dayTasks);
  }, []);

  const handleAddTask = useCallback(
    (date: Date) => {
      const isoDate = date.toISOString();
      onDateClick(isoDate);
      setSelectedDay(null);
    },
    [onDateClick]
  );

  const navigateMonth = useCallback((direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  }, []);

  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    if (refetch) {
      refetch();
    }
  }, [refetch]);

  if (loading) {
    return (
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
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Error loading calendar: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">Calendar View</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-900 min-w-[120px] text-center">
              {monthYear}
            </span>
            <button
              onClick={() => navigateMonth("next")}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <CalendarGrid
        currentDate={currentDate}
        tasks={allTasks}
        onDayClick={handleDayClick}
      />

      <DayModal
        selectedDay={selectedDay}
        tasksForDay={tasksForDay}
        onClose={() => setSelectedDay(null)}
        onTaskClick={onDateClick}
        onAddTask={handleAddTask}
      />

      <StatusLegend />
    </div>
  );
}
