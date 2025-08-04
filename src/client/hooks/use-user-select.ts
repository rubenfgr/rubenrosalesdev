import { useCallback, useMemo, useState } from "react";
import type { SelectOption } from "@/client/components/app-select/app-select.model";
import { type User, useSearchUsers } from "@/client/services/api/users";
import { useDebounce } from "./use-debounce";

/**
 * Hook for user selection with infinite scroll and search
 */
export const useUserSelect = () => {
    const [searchQuery, setSearchQuery] = useState("");

    // Debounce search query to avoid too many API calls
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
        useSearchUsers({
            searchQuery: debouncedSearchQuery,
            limit: 20,
        });

    // Flatten all pages into a single array of users
    const allUsers = useMemo(() => {
        return data?.pages.flatMap((page) => page.users) || [];
    }, [data?.pages]);

    // Convert users to select options
    const userOptions: SelectOption<string>[] = useMemo(() => {
        return allUsers.map((user: User) => ({
            value: user.id,
            label: `${user.name} (${user.email})`,
            disabled: false,
        }));
    }, [allUsers]);

    // Handle search with debouncing
    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    // Load more users (infinite scroll)
    const loadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return {
        options: userOptions,
        searchQuery,
        onSearch: handleSearch,
        loadMore,
        hasMore: hasNextPage,
        isLoading: isLoading || isFetchingNextPage,
        isError,
        error,
        totalUsers: allUsers.length,
    };
};
