import { useEffect, useRef } from "react";

export const useInfiniteScroll = (onLoadMore: (() => void) | undefined, hasMore: boolean) => {
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!onLoadMore || !hasMore) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    onLoadMore();
                }
            },
            { threshold: 1.0 },
        );

        const sentinel = sentinelRef.current;
        if (sentinel) {
            observer.observe(sentinel);
        }

        return () => {
            if (sentinel) {
                observer.unobserve(sentinel);
            }
        };
    }, [onLoadMore, hasMore]);

    return sentinelRef;
};
