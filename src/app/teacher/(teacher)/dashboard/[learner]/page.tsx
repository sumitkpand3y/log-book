"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Calendar,
  User,
  FileText,
  Clock,
  X,
  Loader2,
  Stethoscope,
} from "lucide-react";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useRouter } from "next/navigation";
import { s, sub } from "framer-motion/client";
import { useSearchParams } from "next/navigation";


// Custom hook for URL parameters
const useURLParams = () => {
  const searchParams = useSearchParams();

  const learnerId = searchParams.get("learnerId");
  const submissionId = searchParams.get("submissionId");

  return { learnerId, submissionId };
};


// Custom hook for filters
const useFilters = () => {
  const [filters, setFilters] = useState({
    status: "",
    dateFrom: "",
    dateTo: "",
    sex: "",
    searchTerm: "",
  });

  const updateFilter = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      status: "",
      dateFrom: "",
      dateTo: "",
      sex: "",
      searchTerm: "",
    });
  }, []);

  return { filters, updateFilter, clearFilters };
};

// Custom hook for pagination
const usePagination = (totalItems, itemsPerPage = 5) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const goToPrevious = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    goToPrevious,
    goToNext,
    resetPage,
  };
};

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

const getStatusColor = (status) => {
  const colors = {
    Draft: "bg-gray-100 text-gray-800",
    Submitted: "bg-blue-100 text-blue-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
    Resubmitted: "bg-yellow-100 text-yellow-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

// Filter function
const filterEntries = (entries, filters) => {
  let filtered = entries || [];

  if (filters.status) {
    filtered = filtered.filter(entry => entry.status === filters.status);
  }

  if (filters.sex) {
    filtered = filtered.filter(entry => entry.sex === filters.sex);
  }

  if (filters.dateFrom) {
    filtered = filtered.filter(
      entry => new Date(entry.date) >= new Date(filters.dateFrom)
    );
  }

  if (filters.dateTo) {
    filtered = filtered.filter(
      entry => new Date(entry.date) <= new Date(filters.dateTo)
    );
  }

  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(entry =>
      (entry.caseNo || "").toLowerCase().includes(searchLower) ||
      (entry.chiefComplaint || "").toLowerCase().includes(searchLower) ||
      (entry.diagnosis || "").toLowerCase().includes(searchLower) ||
      (entry.uhid || "").toLowerCase().includes(searchLower)
    );
  }

  return filtered;
};

// Components
const LoadingSpinner = () => (
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

const ErrorDisplay = ({ error }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <X className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Error Loading Data
      </h3>
      <p className="text-gray-600 mb-4">
        {error?.message || "An error occurred while loading log entries."}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  </div>
);

const SearchBar = ({ searchTerm, onSearchChange, onToggleFilters }) => (
  <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search by case no, complaint, diagnosis, or UHID..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
    <button
      onClick={onToggleFilters}
      className="flex items-center justify-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <Filter className="w-4 h-4 mr-2" />
      Filters
    </button>
  </div>
);

const FilterPanel = ({ filters, onFilterChange, onClearFilters }) => (
  <div className="mt-6 pt-6 border-t border-gray-200">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <select
        value={filters.status}
        onChange={(e) => onFilterChange("status", e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">All Status</option>
        <option value="Draft">Draft</option>
        <option value="Submitted">Submitted</option>
        <option value="Approved">Approved</option>
        <option value="Rejected">Rejected</option>
        <option value="Resubmitted">Resubmitted</option>
      </select>

      <select
        value={filters.sex}
        onChange={(e) => onFilterChange("sex", e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">All Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Transgender">Transgender</option>
      </select>

      <input
        type="date"
        value={filters.dateFrom}
        onChange={(e) => onFilterChange("dateFrom", e.target.value)}
        placeholder="From Date"
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <input
        type="date"
        value={filters.dateTo}
        onChange={(e) => onFilterChange("dateTo", e.target.value)}
        placeholder="To Date"
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <button
        onClick={onClearFilters}
        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  </div>
);

const LogEntry = ({ entry, onViewDetails }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            {entry.caseNo}
          </h3>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{formatDate(entry.date)}</span>
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span>{entry.age}y, {entry.sex}</span>
            </div>
            <span className="text-xs sm:text-sm">UHID: {entry.uhid}</span>
          </div>
        </div>
        <div className="mt-2 sm:mt-0 sm:ml-4">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(entry.status)}`}>
            {entry.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-1">Chief Complaint</h4>
          <p className="text-gray-700 text-sm line-clamp-2">
            {entry.chiefComplaint || "Not specified"}
          </p>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 mb-1">Diagnosis</h4>
          <p className="text-gray-700 text-sm font-medium line-clamp-2">
            {entry.diagnosis || "Not specified"}
          </p>
        </div>
      </div>

      {entry.rejectionReason && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            <strong>Rejection Reason:</strong> {entry.rejectionReason}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => onViewDetails(entry)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FileText className="w-4 h-4 mr-2" />
          View Details
        </button>
      </div>
    </div>
  </div>
);

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPrevious, 
  onNext, 
  onGoToPage 
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxPages = Math.min(totalPages, 5);
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4">
        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="flex items-center justify-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-2 sm:mb-0"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </button>

        <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-2 sm:mb-0">
          {getPageNumbers().map(page => (
            <button
              key={page}
              onClick={() => onGoToPage(page)}
              className={`px-3 py-2 rounded-lg text-sm ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              } transition-colors`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

const DetailView = ({ entry, onBack }) => (
  <div className="min-h-screen bg-gray-50">
    <div className="sticky top-0 bg-white shadow-sm border-b border-gray-200 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">Back to Log Book</span>
            <span className="sm:hidden">Back</span>
          </button>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(entry.status)}`}>
            {entry.status}
          </span>
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Case: {entry.caseNo}
              </h2>
              <div className="space-y-1 text-sm sm:text-base text-gray-600">
                <p>Date: {formatDate(entry.date)}</p>
                <p>UHID: {entry.uhid}</p>
              </div>
            </div>
            <div className="lg:text-right">
              <div className="space-y-1 text-sm sm:text-base text-gray-600">
                <p>Age: {entry.age} years</p>
                <p>Sex: {entry.sex}</p>
              </div>
            </div>
          </div>

          {/* Content sections */}
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Chief Complaint
              </h3>
              <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {entry.chiefComplaint || "Not specified"}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                History of Presenting Illness
              </h3>
              <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {entry.historyPresenting || "Not specified"}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Past History
                </h3>
                <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {entry.pastHistory || "Not specified"}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Personal History
                </h3>
                <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {entry.personalHistory || "Not specified"}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Family History
              </h3>
              <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {entry.familyHistory || "Not specified"}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Clinical Examination
              </h3>
              <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {entry.clinicalExamination || "Not specified"}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Laboratory Examinations
              </h3>
              <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {entry.labExaminations || "Not specified"}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Diagnosis
                </h3>
                <div className="text-gray-700 bg-blue-50 p-4 rounded-lg font-medium">
                  {entry.diagnosis || "Not specified"}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Management
                </h3>
                <div className="text-gray-700 bg-green-50 p-4 rounded-lg">
                  {entry.management || "Not specified"}
                </div>
              </div>
            </div>

            {entry.rejectionReason && (
              <div>
                <h3 className="text-lg font-semibold text-red-700 mb-3">
                  Rejection Reason
                </h3>
                <div className="text-red-700 bg-red-50 p-4 rounded-lg border border-red-200">
                  {entry.rejectionReason}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const LogBookViewer = () => {
  const { cases: logEntries, loading, error, fetchCasesByUserID } = useSubmissions();
  const { learnerId, submissionId } = useURLParams();
  const { filters, updateFilter, clearFilters } = useFilters();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const router = useRouter();

  // Filter entries based on current filters
  const filteredEntries = useMemo(() => 
    filterEntries(logEntries, filters), 
    [logEntries, filters]
  );

  const pagination = usePagination(filteredEntries.length, 5);

  // Get current page entries
  const currentEntries = useMemo(() => 
    filteredEntries.slice(pagination.startIndex, pagination.endIndex),
    [filteredEntries, pagination.startIndex, pagination.endIndex]
  );

  // Reset pagination when filters change
  useEffect(() => {
    pagination.resetPage();
  }, [filters, pagination.resetPage]);

  // Fetch data on component mount
 useEffect(() => {
  if (!learnerId) {
    router.replace("/not-found");
    return;
  }

  const timeoutId = setTimeout(() => {
    fetchCasesByUserID(learnerId);
  }, 1000);

  return () => clearTimeout(timeoutId);
}, [learnerId, fetchCasesByUserID]);

  // Event handlers
  const handleSearchChange = useCallback((searchTerm) => {
    updateFilter("searchTerm", searchTerm);
  }, [updateFilter]);

  const handleToggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const handleViewDetails = useCallback((entry) => {
    setSelectedEntry(entry);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedEntry(null);
  }, []);

  // Render states
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  if (selectedEntry) return <DetailView entry={selectedEntry} onBack={handleBackToList} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Log Book Entries
          </h1>
          <p className="text-gray-600">
            Learner ID: {learnerId || "Not specified"}
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4 sm:p-6">
            <SearchBar
              searchTerm={filters.searchTerm}
              onSearchChange={handleSearchChange}
              onToggleFilters={handleToggleFilters}
            />
            
            {showFilters && (
              <FilterPanel
                filters={filters}
                onFilterChange={updateFilter}
                onClearFilters={clearFilters}
              />
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredEntries.length > 0 ? pagination.startIndex + 1 : 0}-
            {Math.min(pagination.endIndex, filteredEntries.length)} of{" "}
            {filteredEntries.length} entries
          </p>
        </div>

        {/* Log Entries */}
        <div className="space-y-4 sm:space-y-6">
          {currentEntries.length > 0 ? (
            currentEntries.map((entry) => (
              <LogEntry
                key={entry.id}
                entry={entry}
                onViewDetails={handleViewDetails}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No entries found
              </h3>
              <p className="text-gray-600">
                {logEntries.length === 0
                  ? "No log entries available for this learner."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPrevious={pagination.goToPrevious}
          onNext={pagination.goToNext}
          onGoToPage={pagination.goToPage}
        />
      </div>
    </div>
  );
};

export default LogBookViewer;