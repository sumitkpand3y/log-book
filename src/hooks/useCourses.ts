// hooks/useCourses.ts
import { useEffect, useState } from "react";
import { courseAPI } from "@/services/course.services";

export function useCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await courseAPI.getEnrolledCourses(); // or getAllCourses()

      let filtercourses = data.data.courses.filter((item)=> item.trainingLocationStatus == 'Active')
      setCourses(filtercourses || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

//   useEffect(() => {
//     fetchCourses();
//   }, []);

  return { courses, loading, error, refetch: fetchCourses };
}
