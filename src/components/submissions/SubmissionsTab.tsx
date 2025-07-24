import { SearchAndFilters } from "../common/SearchAndFilters";
import { SubmissionTable } from "../common/SubmissionTable";

interface SubmissionsTabProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  filteredSubmissions: any[];
  handleOpenLogBook: (submission: any) => void;
  handleBulkApprove: () => void;
  selectedSubmissionIds: string[];
  router: any;
}

export const SubmissionsTab = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  filteredSubmissions,
  handleOpenLogBook,
  handleBulkApprove,
  selectedSubmissionIds,
  router,
}: SubmissionsTabProps) => {
  return (
    <div className="space-y-6">
      <SearchAndFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <SubmissionTable
        filteredSubmissions={filteredSubmissions}
        handleOpenLogBook={handleOpenLogBook}
        handleBulkApprove={handleBulkApprove}
        selectedSubmissionIds={selectedSubmissionIds}
        router={router}
      />
    </div>
  );
};