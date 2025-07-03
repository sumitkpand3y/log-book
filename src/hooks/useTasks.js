import { useState, useEffect, useCallback } from "react";

import { taskAPI } from "@/services/task.services";
import { useAPI } from "./useAPI";

export function useTasks(filters = {}) {
  const [tasks, setTasks] = useState([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const { execute, loading, error } = useAPI();

  const loadTasks = useCallback(
    async (filters = {}) => {
      const paginationParams = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
      };
      console.log("paginationParams:", paginationParams);

      const data = await execute(() => taskAPI.getAllTasks(paginationParams));
      if (data)
        setTasks(data.data.tasks || []),
          setPagination((prev) => ({
            ...prev,
            currentPage: data.data.pagination.page,
            totalPages: data.data.pagination.pages,
            totalItems: data.data.pagination.total,
            itemsPerPage: data.data.pagination.limit,
            hasNextPage: data.data.hasNextPage || false,
            hasPreviousPage: data.data.hasPreviousPage || false,
          }));
    },
    [
      execute,
      filters.status,
      filters.search,
      pagination.currentPage,
      pagination.itemsPerPage,
    ]
  );

  // Load tasks when page changes
  useEffect(() => {
    loadTasks(filters);
  }, [
    filters.status,
    filters.search,
    pagination.currentPage,
    pagination.itemsPerPage,
  ]);

  const goToPage = useCallback((page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const nextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  }, [pagination.hasNextPage]);

  const previousPage = useCallback(() => {
    if (pagination.hasPreviousPage) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  }, [pagination.hasPreviousPage]);

  const changeItemsPerPage = useCallback((itemsPerPage) => {
    setPagination((prev) => ({
      ...prev,
      itemsPerPage,
      currentPage: 1, // Reset to first page when changing items per page
    }));
  }, []);

  const refreshTasks = useCallback(
    (filters = {}) => {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      loadTasks(filters);
    },
    [loadTasks]
  );

  const createTask = async (taskData) => {
    const newTask = await execute(() => taskAPI.createTask(taskData));
    if (newTask) {
      setTasks((prev) => [...prev, newTask]);
      refreshTasks(filters);
    }
    return newTask;
  };

  const updateTask = async (id, taskData) => {
    const updatedTask = await execute(() => taskAPI.updateTask(id, taskData));
    if (updatedTask) {
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
      refreshTasks(filters);
    }
    return updatedTask;
  };

  const deleteTask = async (id) => {
    await execute(() => taskAPI.deleteTask(id));
    setTasks((prev) => prev.filter((task) => task.id !== id));
    refreshTasks(filters);
  };

  const getTaskById = async (id) => {
    try {
      // First check if task exists in current tasks array
      const existingTask = tasks.find((task) => task.id === id);
      if (existingTask) {
        return existingTask;
      }

      // If not found in array, fetch from API
      const taskData = await execute(() => taskAPI.getTaskById(id));
      return taskData;
    } catch (error) {
      console.error("Error fetching task by ID:", error);
      throw error;
    }
  };

  return {
    tasks,
    loading,
    error,
    pagination,
    goToPage,
    nextPage,
    previousPage,
    changeItemsPerPage,
    createTask,
    updateTask,
    deleteTask,
    getTaskById,
    refetch: refreshTasks, // So you can call this manually if needed
  };
}
// refetch: loadTasks,

// export function useTask(id) {
//   console.log("useTask called with id:", id);

//   const [task, setTask] = useState(null);
//   const { execute, loading, error } = useAPI();

//   const loadTask = useCallback(async () => {
//     if (id) {
//       const data = await execute(() => taskAPI.getTaskById(id));
//       if (data) setTask(data);
//     }
//   }, [execute, id]);

//   useEffect(() => {
//     loadTask();
//   }, [loadTask]);

//   const approveTask = async (feedback) => {
//     const result = await execute(() => taskAPI.approveTask(id, feedback));
//     if (result) {
//       setTask((prev) => ({ ...prev, status: "APPROVED" }));
//     }
//     return result;
//   };

//   const rejectTask = async (feedback) => {
//     const result = await execute(() => taskAPI.rejectTask(id, feedback));
//     if (result) {
//       setTask((prev) => ({ ...prev, status: "REJECTED" }));
//     }
//     return result;
//   };

//   return {
//     task,
//     loading,
//     error,
//     approveTask,
//     rejectTask,
//     refetch: loadTask,
//   };
// }
