
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { getQueryFn } from "../lib/queryClient";

export function useProjects(userId?: number) {
  const queryKey = userId 
    ? [`/api/users/${userId}/projects`] 
    : ["/api/projects"];

  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey,
    queryFn: getQueryFn(),
  });

  return {
    projects,
    isLoading,
    error,
  };
}
