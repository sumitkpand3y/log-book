// services/task.services.ts
import { apiFetch } from "@/utils/apiFetch";
import { apiCache } from "@/lib/api/cache"; // make sure this file exports the `cache` Map

interface TaskFilters {
  [key: string]: any;
}

interface TaskData {
  id?: string;
  caseNo: string;
  date: string;
  age: number | string;
  sex: "MALE" | "FEMALE" | "TRANSGENDER";
  uhid: string;
  chiefComplaint: string;
  historyPresenting: string;
  pastHistory?: string;
  personalHistory?: string;
  familyHistory?: string;
  clinicalExamination: string;
  labExaminations?: string;
  diagnosis: string;
  management: string;
  status?: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  courseId: string;
}

export const taskAPI = {
  async getAllTasks(filters: TaskFilters = {}) {
    return apiFetch.get("/tasks", {
      params: filters,
      cache: true,
      cacheTTL: 2 * 60 * 1000,
    });
  },

  async getTasksForReview() {
    return apiFetch.get("/tasks/review", {
      cache: true,
      cacheTTL: 60 * 1000,
    });
  },

  async getTaskById(id: string) {
    return apiFetch.get(`/tasks/${id}`, {
      cache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  },

  async createTask(taskData: TaskData) {
    const response = await apiFetch.post("/tasks", taskData);
    taskAPI.invalidateTaskCaches(); // 👈 clear cache after mutation
    return response;
  },

  async updateTask(id: string, taskData: Partial<TaskData>) {
    const response = await apiFetch.put(`/tasks/${id}`, taskData);
    taskAPI.invalidateTaskCaches(id);
    return response;
  },

  async deleteTask(id: string) {
    const response = await apiFetch.delete(`/tasks/${id}`);
    taskAPI.invalidateTaskCaches(id);
    return response;
  },

  async approveTask(id: string, feedback = "") {
    const response = await apiFetch.post(`/tasks/${id}/approve`, { feedback });
    taskAPI.invalidateTaskCaches(id);
    return response;
  },

  async rejectTask(id: string, feedback = "") {
    const response = await apiFetch.post(`/tasks/${id}/reject`, { feedback });
    taskAPI.invalidateTaskCaches(id);
    return response;
  },

  invalidateTaskCaches(
    taskId: string | null = null,
    paths: string[] = ["/tasks"]
  ) {
    const cacheKeys = Array.from(apiCache.cache.keys());
    const keysToDelete = cacheKeys.filter(
      (key) =>
        paths.some((path) => key.includes(path)) &&
        (taskId ? key.includes(taskId) : true)
    );

    keysToDelete.forEach((key) => apiCache.delete(key));
  },
};
