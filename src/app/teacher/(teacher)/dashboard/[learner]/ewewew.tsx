"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  MessageSquare,
  Calendar,
  AlertCircle,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  Activity,
  Stethoscope,
  Heart,
  Brain,
  Eye,
  Plus,
  Minus,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  ClipboardList,
  Star,
  Award,
  UserCheck,
  MapPin,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function TeacherDashboard(): JSX.Element {
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [showLogModal, setShowLogModal] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Mock medical case data with the structure you provided
  const mockMedicalCases = {
    1: [
      {
        id: "case_001",
        caseNo: "CARD-2024-001",
        date: "2024-07-01",
        age: 65,
        sex: "Male",
        uhid: "UH123456789",
        chiefComplaint: "Chest pain radiating to left arm for 2 hours",
        historyPresenting:
          "Patient presented with sudden onset severe chest pain described as crushing sensation, associated with sweating and nausea. Pain started while climbing stairs.",
        pastHistory:
          "Hypertension for 10 years, Diabetes mellitus type 2 for 5 years, Previous MI 3 years ago",
        personalHistory:
          "Smoker (20 pack-years), Occasional alcohol consumption, Sedentary lifestyle",
        familyHistory: "Father died of MI at age 60, Mother has diabetes",
        clinicalExamination:
          "BP: 140/90 mmHg, HR: 85 bpm, RR: 18/min, Temp: 98.6°F. S3 gallop present, mild pedal edema",
        labExaminations:
          "Troponin I: 2.5 ng/ml (elevated), CK-MB: 45 U/L, ECG: ST elevation in leads II, III, aVF",
        diagnosis:
          "Acute ST-elevation myocardial infarction (STEMI) - Inferior wall",
        management:
          "Thrombolytic therapy initiated, Aspirin, Clopidogrel, Atorvastatin, ACE inhibitor started. Patient referred for urgent PCI",
        status: "Submitted",
        courseId: "CARDIO-2024",
      },
      {
        id: "case_002",
        caseNo: "CARD-2024-002",
        date: "2024-07-02",
        age: 72,
        sex: "Female",
        uhid: "UH987654321",
        chiefComplaint: "Shortness of breath and ankle swelling for 1 week",
        historyPresenting:
          "Progressive dyspnea on exertion, orthopnea, paroxysmal nocturnal dyspnea. Bilateral ankle swelling noticed over past week.",
        pastHistory:
          "Rheumatic heart disease, Atrial fibrillation, Previous stroke 2 years ago",
        personalHistory:
          "Non-smoker, Non-alcoholic, Limited mobility due to stroke",
        familyHistory: "No significant family history",
        clinicalExamination:
          "BP: 110/70 mmHg, HR: 110 bpm (irregular), JVP elevated, Bilateral crepitations, S3 gallop, Hepatomegaly",
        labExaminations:
          "BNP: 850 pg/ml, Echo: EF 35%, Severe mitral stenosis, Moderate tricuspid regurgitation",
        diagnosis:
          "Congestive heart failure with reduced ejection fraction secondary to rheumatic mitral stenosis",
        management:
          "Diuretics (Furosemide), ACE inhibitor, Beta-blocker, Digoxin for rate control, Anticoagulation with warfarin",
        status: "Submitted",
        courseId: "CARDIO-2024",
      },
    ],
    2: [
      {
        id: "case_003",
        caseNo: "ORTHO-2024-001",
        date: "2024-06-30",
        age: 45,
        sex: "Male",
        uhid: "UH456789123",
        chiefComplaint:
          "Right knee pain and inability to bear weight after fall",
        historyPresenting:
          "Patient fell from ladder 3 hours ago, immediate severe pain in right knee, unable to walk or bear weight",
        pastHistory: "No significant past medical history",
        personalHistory: "Construction worker, Non-smoker, Social drinker",
        familyHistory: "No significant family history",
        clinicalExamination:
          "Right knee swollen, tender, deformed. Limited range of motion due to pain. Distal pulses present.",
        labExaminations:
          "X-ray: Displaced intra-articular fracture of tibial plateau, CT scan shows comminuted fracture pattern",
        diagnosis: "Schatzker Type VI tibial plateau fracture",
        management:
          "Immediate immobilization, Pain management, Pre-operative workup completed, Scheduled for ORIF with plate and screws",
        status: "Submitted",
        courseId: "ORTHO-2024",
      },
    ],
    3: [
      {
        id: "case_004",
        caseNo: "EMRG-2024-001",
        date: "2024-06-29",
        age: 28,
        sex: "Female",
        uhid: "UH789123456",
        chiefComplaint: "Motor vehicle accident with multiple injuries",
        historyPresenting:
          "High-speed motor vehicle collision, patient was driver, airbag deployed, complained of chest and abdominal pain",
        pastHistory: "No significant past medical history",
        personalHistory:
          "Healthy young adult, Non-smoker, Occasional alcohol use",
        familyHistory: "No significant family history",
        clinicalExamination:
          "GCS: 15/15, BP: 100/60 mmHg, HR: 110 bpm, Chest wall tenderness, Abdominal guarding, Pelvic stability intact",
        labExaminations:
          "FAST scan: Positive for free fluid in abdomen, CT scan: Grade 3 splenic laceration, Chest X-ray: Multiple rib fractures",
        diagnosis:
          "Polytrauma with splenic laceration and multiple rib fractures",
        management:
          "Trauma protocol activated, IV access, Blood transfusion, Conservative management for spleen, Pain control, ICU monitoring",
        status: "Approved",
        rejectionReason: "",
        courseId: "EMRG-2024",
      },
    ],
    4: [
      {
        id: "case_005",
        caseNo: "PEDS-2024-001",
        date: "2024-06-28",
        age: 8,
        sex: "Male",
        uhid: "UH321654987",
        chiefComplaint: "Fever and cough for 5 days",
        historyPresenting:
          "High-grade fever up to 102°F, productive cough with yellowish sputum, difficulty breathing, decreased appetite",
        pastHistory: "Recurrent respiratory infections, No known allergies",
        personalHistory:
          "School-going child, Up-to-date vaccinations, Lives in urban area",
        familyHistory: "Mother has asthma, Father healthy",
        clinicalExamination:
          "Temp: 101°F, HR: 120 bpm, RR: 28/min, SpO2: 92% on room air, Chest: Bilateral crepitations, Wheeze present",
        labExaminations:
          "WBC: 15,000/μL with neutrophilia, Chest X-ray: Right lower lobe consolidation, Blood culture: Pending",
        diagnosis: "Community-acquired pneumonia with bronchospasm",
        management:
          "IV antibiotics (Ceftriaxone), Bronchodilators, Oxygen therapy, Supportive care with adequate hydration",
        status: "Rejected",
        rejectionReason:
          "Incomplete patient assessment documentation. Please provide detailed growth charts, developmental assessment, and family social history for pediatric patients.",
        courseId: "PEDS-2024",
      },
    ],
  };

  useEffect(() => {
    // Calculate submission status based on cases
    const calculateSubmissionData = () => {
      const submissionData = [
        {
          id: 1,
          learnerName: "Dr. John Doe",
          learnerId: "MED001",
          taskTitle: "Clinical Rotation - Cardiology Ward",
          submissionDate: "2024-07-01T10:30:00Z",
          dueDate: "2024-07-01T23:59:00Z",
          department: "Cardiology",
          priority: "high",
          cases: mockMedicalCases[1] || [],
        },
        {
          id: 2,
          learnerName: "Dr. Jane Smith",
          learnerId: "MED002",
          taskTitle: "Surgery Observation - Orthopedic Procedures",
          submissionDate: "2024-06-30T14:20:00Z",
          dueDate: "2024-07-02T23:59:00Z",
          department: "Orthopedics",
          priority: "medium",
          cases: mockMedicalCases[2] || [],
        },
        {
          id: 3,
          learnerName: "Dr. Mike Johnson",
          learnerId: "MED003",
          taskTitle: "Emergency Department Training",
          submissionDate: "2024-06-29T16:45:00Z",
          dueDate: "2024-06-30T23:59:00Z",
          department: "Emergency",
          priority: "high",
          cases: mockMedicalCases[3] || [],
        },
        {
          id: 4,
          learnerName: "Dr. Sarah Wilson",
          learnerId: "MED004",
          taskTitle: "Pediatric Ward Rounds",
          submissionDate: "2024-06-28T11:30:00Z",
          dueDate: "2024-06-29T23:59:00Z",
          department: "Pediatrics",
          priority: "medium",
          cases: mockMedicalCases[4] || [],
        },
      ];

      // Calculate status based on cases
      const updatedSubmissions = submissionData.map((submission) => {
        const cases = submission.cases;
        const totalCases = cases.length;
        const approvedCases = cases.filter(
          (c) => c.status === "Approved"
        ).length;
        const rejectedCases = cases.filter(
          (c) => c.status === "Rejected"
        ).length;
        const submittedCases = cases.filter(
          (c) => c.status === "Submitted"
        ).length;
        const pendingCases = submittedCases; // Submitted cases are pending review

        let overallStatus;
        if (rejectedCases > 0) {
          overallStatus = "rejected";
        } else if (pendingCases > 0) {
          overallStatus = "pending";
        } else if (approvedCases === totalCases && totalCases > 0) {
          overallStatus = "approved";
        } else {
          overallStatus = "draft";
        }

        return {
          ...submission,
          status: overallStatus,
          totalCases,
          approvedCases,
          rejectedCases,
          pendingCases,
          completedCases: approvedCases,
        };
      });

      return updatedSubmissions;
    };

    setTimeout(() => {
      const calculatedSubmissions = calculateSubmissionData();
      setSubmissions(calculatedSubmissions);
      setFilteredSubmissions(calculatedSubmissions);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = submissions;

    if (searchTerm) {
      filtered = filtered.filter(
        (sub) =>
          sub.learnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.learnerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }

    setFilteredSubmissions(filtered);
  }, [searchTerm, statusFilter, submissions]);

  const handleOpenLogBook = (submission) => {
    setSelectedSubmission(submission);
    // Find first pending (submitted) case
    const pendingCaseIndex = submission.cases.findIndex(
      (c) => c.status === "Submitted"
    );
    setCurrentCaseIndex(pendingCaseIndex >= 0 ? pendingCaseIndex : 0);
    setShowLogModal(true);
  };

  const handleApproveCase = () => {
    const currentCase = selectedSubmission.cases[currentCaseIndex];

    // Update the case status
    const updatedCases = [...selectedSubmission.cases];
    updatedCases[currentCaseIndex] = {
      ...currentCase,
      status: "Approved",
    };

    // Update mock data
    mockMedicalCases[selectedSubmission.id] = updatedCases;

    // Update submissions
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === selectedSubmission.id) {
          const newApprovedCount = updatedCases.filter(
            (c) => c.status === "Approved"
          ).length;
          const newPendingCount = updatedCases.filter(
            (c) => c.status === "Submitted"
          ).length;
          const newRejectedCount = updatedCases.filter(
            (c) => c.status === "Rejected"
          ).length;

          let newStatus;
          if (newRejectedCount > 0) {
            newStatus = "rejected";
          } else if (newPendingCount > 0) {
            newStatus = "pending";
          } else if (newApprovedCount === updatedCases.length) {
            newStatus = "approved";
          } else {
            newStatus = "draft";
          }

          return {
            ...sub,
            cases: updatedCases,
            status: newStatus,
            approvedCases: newApprovedCount,
            pendingCases: newPendingCount,
            rejectedCases: newRejectedCount,
            completedCases: newApprovedCount,
          };
        }
        return sub;
      })
    );

    // Move to next pending case or close modal
    const nextPendingIndex = updatedCases.findIndex(
      (c, index) => index > currentCaseIndex && c.status === "Submitted"
    );

    if (nextPendingIndex >= 0) {
      setCurrentCaseIndex(nextPendingIndex);
    } else {
      setShowLogModal(false);
      alert("Case approved successfully!");
    }
  };

  const handleRejectCase = () => {
    if (!rejectComment.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    const currentCase = selectedSubmission.cases[currentCaseIndex];

    // Update the case status
    const updatedCases = [...selectedSubmission.cases];
    updatedCases[currentCaseIndex] = {
      ...currentCase,
      status: "Rejected",
      rejectionReason: rejectComment,
    };

    // Update mock data
    mockMedicalCases[selectedSubmission.id] = updatedCases;

    // Update submissions
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === selectedSubmission.id) {
          const newApprovedCount = updatedCases.filter(
            (c) => c.status === "Approved"
          ).length;
          const newPendingCount = updatedCases.filter(
            (c) => c.status === "Submitted"
          ).length;
          const newRejectedCount = updatedCases.filter(
            (c) => c.status === "Rejected"
          ).length;

          return {
            ...sub,
            cases: updatedCases,
            status: "rejected",
            approvedCases: newApprovedCount,
            pendingCases: newPendingCount,
            rejectedCases: newRejectedCount,
            completedCases: newApprovedCount,
          };
        }
        return sub;
      })
    );

    setShowLogModal(false);
    setRejectComment("");
    alert("Case rejected. Student will be notified for corrections.");
  };

  const handleNextCase = () => {
    const pendingCases = selectedSubmission.cases.filter(
      (c) => c.status === "Submitted"
    );
    const currentPendingIndex = pendingCases.findIndex(
      (c) => c.id === selectedSubmission.cases[currentCaseIndex].id
    );

    if (currentPendingIndex < pendingCases.length - 1) {
      const nextPendingCase = pendingCases[currentPendingIndex + 1];
      const nextIndex = selectedSubmission.cases.findIndex(
        (c) => c.id === nextPendingCase.id
      );
      setCurrentCaseIndex(nextIndex);
    }
  };

  const handlePreviousCase = () => {
    const pendingCases = selectedSubmission.cases.filter(
      (c) => c.status === "Submitted"
    );
    const currentPendingIndex = pendingCases.findIndex(
      (c) => c.id === selectedSubmission.cases[currentCaseIndex].id
    );

    if (currentPendingIndex > 0) {
      const prevPendingCase = pendingCases[currentPendingIndex - 1];
      const prevIndex = selectedSubmission.cases.findIndex(
        (c) => c.id === prevPendingCase.id
      );
      setCurrentCaseIndex(prevIndex);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-blue-700 bg-blue-100 border-blue-200";
      case "approved":
        return "text-green-700 bg-green-100 border-green-200";
      case "rejected":
        return "text-red-700 bg-red-100 border-red-200";
      case "draft":
        return "text-gray-700 bg-gray-100 border-gray-200";
      default:
        return "text-gray-700 bg-gray-100 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
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

  const getDepartmentIcon = (department) => {
    switch (department.toLowerCase()) {
      case "cardiology":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "orthopedics":
        return <Activity className="w-5 h-5 text-blue-500" />;
      case "emergency":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "pediatrics":
        return <Users className="w-5 h-5 text-green-500" />;
      case "neurology":
        return <Brain className="w-5 h-5 text-purple-500" />;
      default:
        return <Stethoscope className="w-5 h-5 text-gray-500" />;
    }
  };

  const getReportData = () => {
    const total = submissions.length;
    const approved = submissions.filter((s) => s.status === "approved").length;
    const rejected = submissions.filter((s) => s.status === "rejected").length;
    const pending = submissions.filter((s) => s.status === "pending").length;

    return {
      total,
      approved,
      rejected,
      pending,
      approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) : 0,
      pieData: [
        { name: "Approved", value: approved, color: "#10b981" },
        { name: "Pending", value: pending, color: "#3b82f6" },
        { name: "Rejected", value: rejected, color: "#ef4444" },
      ],
    };
  };

  const reportData = getReportData();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Medical Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-2 rounded-xl">
                <Stethoscope className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Medical Training Dashboard
                </h1>
                <p className="text-blue-100">
                  Clinical Log Book Management System
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === "dashboard"
                    ? "bg-white text-blue-600 shadow-lg"
                    : "text-white hover:bg-blue-500"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === "reports"
                    ? "bg-white text-blue-600 shadow-lg"
                    : "text-white hover:bg-blue-500"
                }`}
              >
                Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && (
          <>
            {/* Medical Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Pending Reviews
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {reportData.pending}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Approved
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {reportData.approved}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Needs Revision
                    </p>
                    <p className="text-3xl font-bold text-red-600">
                      {reportData.rejected}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-xl">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Success Rate
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {reportData.approvalRate}%
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by doctor name, department, or task..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Needs Revision</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Clinical Log Books */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <ClipboardList className="w-6 h-6 mr-2 text-blue-600" />
                  Clinical Log Book Submissions
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Medical Student
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Clinical Training
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Cases Progress
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredSubmissions.map((submission) => (
                      <tr
                        key={submission.id}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900">
                                {submission.learnerName}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <span className="mr-2">
                                  ID: {submission.learnerId}
                                </span>
                                {getDepartmentIcon(submission.department)}
                                <span className="ml-1">
                                  {submission.department}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {submission.taskTitle}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Calendar className="w-4 h-4 mr-1" />
                              Submitted:{" "}
                              {new Date(
                                submission.submissionDate
                              ).toLocaleDateString()}
                            </div>
                            <div
                              className={`text-xs px-2 py-1 rounded-full inline-flex items-center mt-2 ${getPriorityColor(
                                submission.priority
                              )}`}
                            >
                              <span className="w-2 h-2 rounded-full bg-current mr-1"></span>
                              {submission.priority.toUpperCase()} PRIORITY
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                Total Cases:
                              </span>
                              <span className="font-semibold">
                                {submission.totalCases}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${
                                    submission.totalCases > 0
                                      ? (submission.completedCases /
                                          submission.totalCases) *
                                        100
                                      : 0
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>✓ {submission.approvedCases} Approved</span>
                              <span>⏳ {submission.pendingCases} Pending</span>
                              <span>✗ {submission.rejectedCases} Rejected</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              submission.status
                            )}`}
                          >
                            {submission.status === "pending" && (
                              <Clock className="w-3 h-3 mr-1" />
                            )}
                            {submission.status === "approved" && (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            {submission.status === "rejected" && (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {submission.status === "draft" && (
                              <FileText className="w-3 h-3 mr-1" />
                            )}
                            {submission.status.charAt(0).toUpperCase() +
                              submission.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleOpenLogBook(submission)}
                              className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm leading-4 font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Review Cases
                            </button>
                            <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Feedback
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredSubmissions.length === 0 && (
                <div className="text-center py-12">
                  <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">
                    No submissions found
                  </p>
                  <p className="text-gray-400 mt-1">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "reports" && (
          <div className="space-y-6">
            {/* Reports Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Summary Stats */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Submission Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Total Submissions
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      {reportData.total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Approved
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {reportData.approved}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Pending Review
                    </span>
                    <span className="text-xl font-bold text-yellow-600">
                      {reportData.pending}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Needs Revision
                    </span>
                    <span className="text-xl font-bold text-red-600">
                      {reportData.rejected}
                    </span>
                  </div>
                </div>
              </div>

              {/* Department Performance */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                  Department Performance
                </h3>
                <div className="space-y-3">
                  {["Cardiology", "Orthopedics", "Emergency", "Pediatrics"].map(
                    (dept) => {
                      const deptSubmissions = submissions.filter(
                        (s) => s.department === dept
                      );
                      const approvedCount = deptSubmissions.filter(
                        (s) => s.status === "approved"
                      ).length;
                      const successRate =
                        deptSubmissions.length > 0
                          ? (
                              (approvedCount / deptSubmissions.length) *
                              100
                            ).toFixed(1)
                          : 0;

                      return (
                        <div
                          key={dept}
                          className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
                        >
                          <div className="flex items-center">
                            {getDepartmentIcon(dept)}
                            <span className="ml-2 font-medium text-gray-700">
                              {dept}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-900">
                              {successRate}%
                            </div>
                            <div className="text-xs text-gray-500">
                              {deptSubmissions.length} submissions
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Download className="w-5 h-5 mr-2 text-green-600" />
                Export Reports
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center justify-center px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  <span className="font-medium text-blue-700">
                    Export to PDF
                  </span>
                </button>
                <button className="flex items-center justify-center px-4 py-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                  <Download className="w-5 h-5 mr-2 text-green-600" />
                  <span className="font-medium text-green-700">
                    Export to Excel
                  </span>
                </button>
                <button className="flex items-center justify-center px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                  <span className="font-medium text-purple-700">
                    Generate Analytics
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Medical Case Review Modal */}
      {showLogModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
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
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Case Navigation */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-600">
                    Case {currentCaseIndex + 1} of{" "}
                    {selectedSubmission.cases.length}
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
                <div className="flex space-x-2">
                  <button
                    onClick={handlePreviousCase}
                    disabled={currentCaseIndex === 0}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextCase}
                    disabled={
                      currentCaseIndex === selectedSubmission.cases.length - 1
                    }
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Case Details */}
            <div className="flex-1 overflow-y-auto max-h-[60vh]">
              {selectedSubmission.cases[currentCaseIndex] && (
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
                              {
                                selectedSubmission.cases[currentCaseIndex]
                                  .caseNo
                              }
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
              )}
            </div>

            {/* Modal Actions */}
            {selectedSubmission.cases[currentCaseIndex]?.status ===
              "Submitted" && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comments (required for rejection):
                    </label>
                    <textarea
                      value={rejectComment}
                      onChange={(e) => setRejectComment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Provide feedback or reason for rejection..."
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
