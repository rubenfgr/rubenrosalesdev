import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { z } from "zod";
import { prisma } from "@/server/services/prisma";

const getUsersSearchSchema = z.object({
    q: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).default(10),
    offset: z.coerce.number().min(0).default(0),
});

export const ServerRoute = createServerFileRoute("/api/users-new").methods({
    GET: async ({ request }: { request: Request }) => {
        try {
            const url = new URL(request.url);
            const searchParams = Object.fromEntries(url.searchParams);

            const { q, limit, offset } = getUsersSearchSchema.parse(searchParams);

            const where = q
                ? {
                    OR: [
                        { name: { contains: q, mode: "insensitive" as const } },
                        { email: { contains: q, mode: "insensitive" as const } },
                    ],
                }
                : {};

            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                    take: limit,
                    skip: offset,
                    orderBy: { name: "asc" },
                }),
                prisma.user.count({ where }),
            ]);

            return json({
                users,
                total,
                hasMore: offset + limit < total,
            });
        } catch (error) {
            console.error("Error fetching users:", error);
            return json({ error: "Failed to fetch users" }, { status: 500 });
        }
    },
});
