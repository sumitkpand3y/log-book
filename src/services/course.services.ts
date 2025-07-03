import { apiFetch } from "@/utils/apiFetch";

interface CourseData {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  facultyName: string;
  enrollmentNumber?: string;
  status?: "Not Started" | "Allocated" | "Started" | "Completed";
}

interface CourseEnrollmentData {
  courseId: string;
  learnerId?: string;
}

export const courseAPI = {
  async getAllCourses() {
    try {
      return await apiFetch.get("/courses", {
        cache: true,
        cacheTTL: 2 * 60 * 1000,
      });
    } catch (error) {
      console.error("Failed to fetch all courses:", error);
      return [];
    }
  },

  async getCourseById(id: string) {
    try {
      return await apiFetch.get(`/courses/${id}`, {
        cache: true,
        cacheTTL: 5 * 60 * 1000,
      });
    } catch (error) {
      console.error(`Failed to fetch course with ID ${id}:`, error);
      return null;
    }
  },

  async getEnrolledCourses() {
    try {
      return await apiFetch.get("/courses/enrolled", {
        cache: true,
        cacheTTL: 60 * 1000,
      });
    } catch (error) {
      console.error("Failed to fetch enrolled courses:", error);
      return [];
    }
  },

  async createCourse(data: CourseData) {
    try {
      return await apiFetch.post("/courses", data);
    } catch (error) {
      console.error("Failed to create course:", error);
      throw error; // You can catch this in the UI if needed
    }
  },

  async updateCourse(id: string, data: Partial<CourseData>) {
    try {
      return await apiFetch.put(`/courses/${id}`, data);
    } catch (error) {
      console.error(`Failed to update course ${id}:`, error);
      throw error;
    }
  },

  async deleteCourse(id: string) {
    try {
      return await apiFetch.delete(`/courses/${id}`);
    } catch (error) {
      console.error(`Failed to delete course ${id}:`, error);
      throw error;
    }
  },

  async enrollInCourse(data: CourseEnrollmentData) {
    try {
      return await apiFetch.post("/courses/enroll", data);
    } catch (error) {
      console.error("Failed to enroll in course:", error);
      throw error;
    }
  },

  async unenrollFromCourse(courseId: string) {
    try {
      return await apiFetch.delete(`/courses/${courseId}/unenroll`);
    } catch (error) {
      console.error(`Failed to unenroll from course ${courseId}:`, error);
      throw error;
    }
  },

  async getCourseEnrollments(courseId: string) {
    try {
      return await apiFetch.get(`/courses/${courseId}/enrollments`);
    } catch (error) {
      console.error(`Failed to fetch enrollments for course ${courseId}:`, error);
      return [];
    }
  },
};
