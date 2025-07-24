import {
  Heart,
  Activity,
  AlertCircle,
  Users,
  Brain,
  Stethoscope,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react";

export const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "text-blue-700 bg-blue-100 border-blue-200";
    case "approved":
      return "text-green-700 bg-green-100 border-green-200";
    case "rejected":
      return "text-red-700 bg-red-100 border-red-200";
    case "submitted":
      return "text-gray-700 bg-yellow-100 border-gray-200";
    case "draft":
      return "text-gray-700 bg-gray-100 border-gray-200";
    default:
      return "text-gray-700 bg-gray-100 border-gray-200";
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "text-red-700 bg-red-50 border-red-200";
    case "medium":
      return "text-yellow-700 bg-yellow-50 border-yellow-200";
    case "low":
      return "text-green-700 bg-green-50 border-green-200";
    default:
      return "text-gray-700 bg-gray-50 border-gray-200";
  }
};

// export const getDepartmentIcon = (department: string) => {
//   switch (department.toLowerCase()) {
//     case "cardiology":
//       return <Heart className="w-5 h-5 text-red-500" />;
//     case "orthopedics":
//       return <Activity className="w-5 h-5 text-blue-500" />;
//     case "emergency":
//       return <AlertCircle className="w-5 h-5 text-orange-500" />;
//     case "pediatrics":
//       return <Users className="w-5 h-5 text-green-500" />;
//     case "neurology":
//       return <Brain className="w-5 h-5 text-purple-500" />;
//     default:
//       return <Stethoscope className="w-5 h-5 text-gray-500" />;
//   }
// };

export const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateString;
  }
};

export const getTableStatusColor = (status: string): string => {
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