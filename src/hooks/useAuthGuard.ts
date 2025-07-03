import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useAuthGuard = (allowedRoles: string[] = []) => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (
      !token ||
      !role ||
      (allowedRoles.length && !allowedRoles.includes(role))
    ) {
      router.replace("/login");
    }
  }, []);
};
