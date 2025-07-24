'use client';

import Link from "next/link";
import { MapPin, Calendar, User, BookOpen } from "lucide-react";

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
  title: string;
  shortname: string;
  primaryTrainer: string;
  trainingLocation: string;
}

interface CourseCardsProps {
  courses: Course[];
}

export default function CourseCards({ courses }: CourseCardsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      case "Allocated":
        return "bg-blue-100 text-blue-800";
      case "Active":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">My Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/learner/logpage?id=${course.id}`} // 🔁 Update this path based on your route
            className="block"
          >
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600">#{course.shortname}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    course.trainingLocationStatus
                  )}`}
                >
                  {course.trainingLocationStatus}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>
                    {course.primaryTrainer}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {course.hospitalName}, {course.trainingLocation}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(course.startDate).toLocaleDateString()} -{" "}
                    {new Date(course.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Program:</span>{" "}
                  {course.name}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
