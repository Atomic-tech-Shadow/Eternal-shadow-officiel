
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { getQueryFn } from "../lib/queryClient";
import { useAuth } from "./use-auth"; // Correction de l'import

export function useProjects(userId?: number) {
  const { user } = useAuth(); // Utilisation de useAuth
  const queryKey = userId
    ? [`/api/users/${userId}/projects`]
    : ["/api/projects"];

  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey,
    queryFn: getQueryFn(),
    onError: (error) => {
      // Handle errors, including 401 (Unauthorized)
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized access:", error);
      } else {
        console.error("Error fetching projects:", error);
      }
    }
  });

  return {
    projects: projects || [], // Handle potential null/undefined data
    isLoading,
    error,
  };
}
