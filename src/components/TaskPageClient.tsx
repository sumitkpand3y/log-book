"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Save,
  Send,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ---------- Interfaces ----------
interface Task {
  id: string;
  caseNo: string;
  date: string;
  age: number;
  sex: "Male" | "Female" | "Transgender";
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
  status: "Draft" | "Submitted" | "Approved" | "Rejected" | "Resubmitted";
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

// ---------- Component ----------
export default function TaskPage({
  params,
}: {
  params: { learner: string; action: string };
}) {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const taskId = searchParams.get("id");
  const selectedDate = searchParams.get("date") || undefined;

  const [task, setTask] = useState<Task | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // const action = params.action;

  // ---------- Fetch Courses + Task ----------
  useEffect(() => {
    async function fetchData() {
      try {
        const courseRes = await fetch("/learner.json");
        const courseData = await courseRes.json();
        setCourses(courseData.courses);

        if (action === "edit" && taskId) {
          const taskRes = await fetch(`/api/tasks/${taskId}`);
          const taskData = await taskRes.json();
          setTask(taskData);
          setFormData({ ...taskData });
        } else {
          setFormData({
            caseNo: "",
            date: selectedDate || new Date().toISOString().split("T")[0],
            age: 0,
            sex: "Male",
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
            courseId: courseData.courses[0]?.id || "",
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setLoading(false);
      }
    }

    fetchData();
  }, [taskId, action]);

  // ---------- Validation ----------
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.caseNo?.trim()) newErrors.caseNo = "Case No is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.age || formData.age <= 0) newErrors.age = "Valid age required";
    if (!formData.uhid?.trim()) newErrors.uhid = "UHID is required";
    if (!formData.chiefComplaint?.trim()) newErrors.chiefComplaint = "Chief Complaint required";
    if (!formData.courseId) newErrors.courseId = "Course is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------- Save/Submit Mutation ----------
  const mutation = useMutation({
    mutationFn: async ({
      isDraft,
      payload,
    }: {
      isDraft: boolean;
      payload: Task;
    }) => {
      const method = action === "edit" ? "PUT" : "POST";
      const url = action === "edit" ? `/api/tasks/${taskId}` : `/api/tasks`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, status: isDraft ? "Draft" : "Submitted" }),
      });

      if (!res.ok) throw new Error("Failed to save task");

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      window.history.back(); // or redirect
    },
    onError: (error) => {
      console.error("Error saving task:", error);
    },
  });

  const handleSave = (isDraft: boolean) => {
    if (!isDraft && !validateForm()) return;

    mutation.mutate({
      isDraft,
      payload: {
        ...formData,
        rejectionReason: task?.rejectionReason,
      },
    });
  };

  const navigateDate = (dir: "prev" | "next") => {
    const current = new Date(formData.date);
    current.setDate(current.getDate() + (dir === "next" ? 1 : -1));
    setFormData((prev: any) => ({
      ...prev,
      date: current.toISOString().split("T")[0],
    }));
  };

  if (loading || !formData)
    return <div className="p-10 text-center">Loading...</div>;

  // ---------- Render UI ----------
  return (
    <div className="p-4">
      <div className="bg-white rounded-xl w-full max-h-[90vh] overflow-hidden">
        {/* FORM HEADER + FIELDS */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          {/* Basic Info */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            {/* Course */}
            <select
              value={formData.courseId}
              onChange={(e) =>
                setFormData((prev: any) => ({ ...prev, courseId: e.target.value }))
              }
              className={`w-full p-3 border rounded-lg ${
                errors.courseId ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title} - {course.enrollmentNumber}
                </option>
              ))}
            </select>
            {errors.courseId && (
              <p className="text-red-500 text-sm">{errors.courseId}</p>
            )}

            {/* Case No */}
            <input
              type="text"
              placeholder="Case No"
              value={formData.caseNo}
              onChange={(e) =>
                setFormData((prev: any) => ({ ...prev, caseNo: e.target.value }))
              }
              className={`w-full p-3 border rounded-lg ${
                errors.caseNo ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.caseNo && (
              <p className="text-red-500 text-sm">{errors.caseNo}</p>
            )}

            {/* Date */}
            <div className="flex items-center space-x-2">
              <button onClick={() => navigateDate("prev")}>
                <ChevronLeft />
              </button>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev: any) => ({ ...prev, date: e.target.value }))
                }
                className={`w-full p-3 border rounded-lg ${
                  errors.date ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button onClick={() => navigateDate("next")}>
                <ChevronRight />
              </button>
            </div>
            {errors.date && <p className="text-red-500">{errors.date}</p>}

            {/* UHID */}
            <input
              type="text"
              placeholder="UHID"
              value={formData.uhid}
              onChange={(e) =>
                setFormData((prev: any) => ({ ...prev, uhid: e.target.value }))
              }
              className={`w-full p-3 border rounded-lg ${
                errors.uhid ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.uhid && (
              <p className="text-red-500 text-sm">{errors.uhid}</p>
            )}
          </div>

          {/* Clinical Section (trimmed for brevity) */}
          {/* ... add other inputs like age, sex, complaints, etc. just like your original form ... */}

          {/* Rejection Note */}
          {task?.rejectionReason && (
            <div className="bg-red-50 border p-4 text-sm text-red-700">
              <strong>Rejection Reason:</strong> {task.rejectionReason}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 flex justify-between">
          <button
            onClick={() => window.history.back()}
            className="border px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
          <div className="flex space-x-3">
            <button
              onClick={() => handleSave(true)}
              className="bg-gray-700 text-white px-6 py-2 rounded-lg flex items-center"
            >
              <Save className="w-4 h-4 mr-2" /> Save as Draft
            </button>
            <button
              onClick={() => handleSave(false)}
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg flex items-center"
            >
              <Send className="w-4 h-4 mr-2" /> Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
