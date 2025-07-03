import { apiFetch } from '@/utils/apiFetch'
import { apiCache } from '@/lib/api/cache'

export const taskAPI = {
  // Get all tasks with optional filtering
  async getAllTasks(filters = {}) {
    return apiFetch.get('/tasks', {
      params: filters,
      cache: true,
      cacheTTL: 2 * 60 * 1000, // 2 minutes for task lists
    });
  },

  // Get tasks for teacher review
  async getTasksForReview() {
    return apiFetch.get('/tasks/review', {
      cache: true,
      cacheTTL: 1 * 60 * 1000, // 1 minute for review tasks
    });
  },

  // Get single task by ID
  async getTaskById(id) {
    return apiFetch.get(`/tasks/${id}`, {
      cache: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes for individual tasks
    });
  },

  // Create new task
  async createTask(taskData) {
    const response = await apiFetch.post('/tasks', taskData);
    // Invalidate related cache entries
    this.invalidateTaskCaches();
    return response;
  },

  // Update task
  async updateTask(id, taskData) {
    const response = await apiFetch.put(`/tasks/${id}`, taskData);
    // Invalidate related cache entries
    this.invalidateTaskCaches(id);
    return response;
  },

  // Delete task
  async deleteTask(id) {
    const response = await apiFetch.delete(`/tasks/${id}`);
    // Invalidate related cache entries
    this.invalidateTaskCaches(id);
    return response;
  },

  // Approve task
  async approveTask(id, feedback = '') {
    const response = await apiFetch.post(`/tasks/${id}/approve`, { feedback });
    this.invalidateTaskCaches(id);
    return response;
  },

  // Reject task
  async rejectTask(id, feedback = '') {
    const response = await apiFetch.post(`/tasks/${id}/reject`, { feedback });
    this.invalidateTaskCaches(id);
    return response;
  },

  // Helper method to invalidate task-related caches
  invalidateTaskCaches(taskId = null) {
    // Clear all task-related cache entries
    const cacheKeys = Array.from(apiCache.cache.keys());
    const taskCacheKeys = cacheKeys.filter(key => 
      key.includes('/tasks') && (taskId ? key.includes(taskId) : true)
    );
    
    taskCacheKeys.forEach(key => apiCache.delete(key));
  },
};