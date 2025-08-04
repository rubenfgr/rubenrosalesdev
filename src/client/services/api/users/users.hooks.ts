import { useInfiniteQuery } from "@tanstack/react-query";

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface UsersResponse {
    users: User[];
    total: number;
    hasMore: boolean;
}

export interface UseSearchUsersParams {
    searchQuery?: string;
    limit?: number;
}

/**
 * Hook to search users with infinite scroll
 */
export const useSearchUsers = ({ searchQuery = "", limit = 20 }: UseSearchUsersParams = {}) => {
    return useInfiniteQuery({
        queryKey: ["users", "search", searchQuery, limit],
        queryFn: async ({ pageParam = 0 }) => {
            const params = new URLSearchParams({
                offset: pageParam.toString(),
                limit: limit.toString(),
            });

            if (searchQuery) {
                params.append("q", searchQuery);
            }

            const response = await fetch(`/api/users?${params.toString()}`);

            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }

            const data: UsersResponse = await response.json();
            return data;
        },
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage.hasMore) return undefined;
            return allPages.length * limit;
        },
        initialPageParam: 0,
        enabled: true,
        staleTime: 0, // Always fetch fresh data in development
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });
};
