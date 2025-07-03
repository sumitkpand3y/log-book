"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Activity,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  Edit3,
  Eye,
  Heart,
  Search,
  Stethoscope,
  Trash2,
  XCircle,
  ChevronLeft,
  ChevronRight,
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

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ListViewProps {
  tasksList: Task[];
  onDateClick: (date: string) => void;
  loading?: boolean;
  error?: string;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  onSearch?: (searchTerm: string) => void;
  onStatusFilter?: (status: string) => void;
}

// Constants
const STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "APPROVED", label: "Approved" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "RESUBMITTED", label: "Resubmitted" },
];

const ITEMS_PER_PAGE_OPTIONS = [
  { value: 10, label: "10 per page" },
  { value: 20, label: "20 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
];

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

const getDepartmentIcon = (department: string) => {
  const icons = {
    Cardiology: <Heart className="w-4 h-4 text-red-500" />,
    Emergency: <Activity className="w-4 h-4 text-orange-500" />,
    Surgery: <Activity className="w-4 h-4 text-blue-500" />,
  };
  return (
    icons[department as keyof typeof icons] || (
      <Stethoscope className="w-4 h-4 text-gray-500" />
    )
  );
};

// Components
const SearchAndFilter = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onSearch,
  onStatusFilter,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  onSearch?: (searchTerm: string) => void;
  onStatusFilter?: (status: string) => void;
}) => {
  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    if (onStatusFilter) {
      onStatusFilter(status);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by case number, diagnosis..."
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {statusFilter}
        <div className="w-full sm:w-48">
          <select
            className="w-full px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

const StatusIcon = ({ status }: { status: string }) => {
  const icons = {
    DRAFT: <Clock className="w-3 h-3 mr-1" />,
    APPROVED: <CheckCircle className="w-3 h-3 mr-1" />,
    REJECTED: <XCircle className="w-3 h-3 mr-1" />,
  };
  return icons[status as keyof typeof icons] || null;
};

const TaskTable = ({
  tasks,
  onDateClick,
  onDeleteEntry,
}: {
  tasks: Task[];
  onDateClick: (id: string) => void;
  onDeleteEntry: (id: string) => void;
}) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
        <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" />
        <span className="hidden sm:inline">Logbook Entries</span>
        <span className="sm:hidden">Entries</span>
        <span className="ml-2 text-sm font-normal text-gray-600">
          ({tasks.length})
        </span>
      </h2>
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Case Details
            </th>
            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
              Patient Info
            </th>
            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Diagnosis
            </th>
            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {tasks.map((entry) => (
            <tr key={entry.id} className="hover:bg-blue-50 transition-colors">
              <td className="px-4 sm:px-6 py-4">
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    {entry.caseNo}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 flex items-center">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {new Date(entry.date).toLocaleDateString()}
                  </div>
                  {entry.department && (
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                      {getDepartmentIcon(entry.department)}
                      <span className="ml-1">{entry.department}</span>
                    </div>
                  )}
                  {/* Mobile-only patient info */}
                  <div className="sm:hidden mt-2 text-xs text-gray-500">
                    {entry.uhid && <div>UHID: {entry.uhid}</div>}
                    {entry.age && entry.sex && (
                      <div>
                        {entry.age} years, {entry.sex}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                <div className="text-sm">
                  {entry.uhid && (
                    <div className="font-medium text-gray-900">
                      UHID: {entry.uhid}
                    </div>
                  )}
                  {entry.age && entry.sex && (
                    <div className="text-gray-500">
                      {entry.age} years, {entry.sex}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 sm:px-6 py-4">
                <div
                  className="text-sm text-gray-900 max-w-xs truncate"
                  title={entry.diagnosis}
                >
                  {entry.diagnosis || "No diagnosis"}
                </div>
                {entry.chiefComplaint && (
                  <div
                    className="text-xs text-gray-500 max-w-xs truncate"
                    title={entry.chiefComplaint}
                  >
                    {entry.chiefComplaint}
                  </div>
                )}
              </td>
              <td className="px-4 sm:px-6 py-4">
                <span
                  className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getTableStatusColor(
                    entry.status
                  )}`}
                >
                  <StatusIcon status={entry.status} />
                  <span className="hidden sm:inline">
                    {entry.status.charAt(0).toUpperCase() +
                      entry.status.slice(1)}
                  </span>
                  <span className="sm:hidden">{entry.status.charAt(0)}</span>
                </span>
              </td>
              <td className="px-4 sm:px-6 py-4">
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => alert(`Viewing details for ${entry.caseNo}`)}
                    className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDateClick(entry.id)}
                    className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded transition-colors"
                    title="Edit Entry"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteEntry(entry.id)}
                    className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {tasks.length === 0 && (
      <div className="text-center py-8 text-gray-500">
        <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No entries found</p>
      </div>
    )}
  </div>
);

const PaginationControls = ({
  pagination,
  onPageChange,
  onNextPage,
  onPreviousPage,
  onItemsPerPageChange,
}: {
  pagination: PaginationInfo;
  onPageChange?: (page: number) => void;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}) => {
  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPreviousPage,
  } = pagination;

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Items info and per page selector */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing {startItem} to {endItem} of {totalItems} entries
          </div>
          {onItemsPerPageChange && (
            <div className="flex items-center gap-2">
              <select
                className="text-sm px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              >
                {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2">
          <button
            disabled={!hasPreviousPage}
            onClick={onPreviousPage}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && onPageChange?.(page)}
                disabled={page === '...'}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : page === '...'
                    ? 'text-gray-400 cursor-default'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            disabled={!hasNextPage}
            onClick={onNextPage}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function ListView({
  tasksList,
  onDateClick,
  loading = false,
  error = null,
  pagination,
  onPageChange,
  onNextPage,
  onPreviousPage,
  onItemsPerPageChange,
  onSearch,
  onStatusFilter,
}: ListViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const handleDeleteEntry = useCallback((id: string) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      // Here you would typically call your delete API
    }
  }, []);

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
          <p className="text-red-600">Error loading List: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SearchAndFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onSearch={onSearch}
        onStatusFilter={onStatusFilter}
      />

      <TaskTable
        tasks={tasksList}
        onDateClick={onDateClick}
        onDeleteEntry={handleDeleteEntry}
      />

      {pagination && (
        <PaginationControls
          pagination={pagination}
          onPageChange={onPageChange}
          onNextPage={onNextPage}
          onPreviousPage={onPreviousPage}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      )}
    </div>
  );
}