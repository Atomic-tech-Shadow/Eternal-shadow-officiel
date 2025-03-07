import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { getQueryFn } from "../lib/queryClient";
import { useAuth } from './authContext'; // Added import for useAuth

export function useProjects(userId?: number) {
  const { user } = useAuth(); // Added to access user from auth context
  const queryKey = userId
    ? [`/api/users/${userId}/projects`]
    : ["/api/projects"];

  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey,
    queryFn: getQueryFn(),
    onError: (error) => {
      // Handle errors, including 401 (Unauthorized)
      if (error.response && error.response.status === 401) {
        // Perform appropriate action, e.g., redirect to login
        console.error("Unauthorized access:", error);
        // Add your 401 handling logic here.  Example:  router.push('/login');
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