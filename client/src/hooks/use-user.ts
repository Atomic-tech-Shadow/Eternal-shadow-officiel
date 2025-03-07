
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn } from "../lib/queryClient";

export function useUser(userId?: number) {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: userId ? [`/api/users/${userId}`] : ["/api/user"],
    queryFn: getQueryFn(),
    enabled: userId !== undefined || true,
  });

  return {
    user,
    isLoading,
    error,
  };
}
