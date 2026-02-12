import { auth } from "../../lib/auth";
import prisma from "../../lib/prisma";

const MAX_USER_IDS = 500;

const toHeaders = (input: Record<string, string | string[] | undefined>) => {
  const headers = new Headers();
  for (const [key, value] of Object.entries(input)) {
    if (!value) continue;
    if (Array.isArray(value)) {
      headers.set(key, value.join(","));
      continue;
    }
    headers.set(key, value);
  }
  return headers;
};

const normalizeUserIds = (value: unknown) => {
  if (!Array.isArray(value)) return null;

  const seen = new Set<string>();
  const userIds: string[] = [];

  for (const item of value) {
    if (typeof item !== "string") return null;
    const id = item.trim();
    if (!id) return null;
    if (seen.has(id)) continue;
    seen.add(id);
    userIds.push(id);
    if (userIds.length > MAX_USER_IDS) return null;
  }

  return userIds;
};

export default defineEventHandler(async (event) => {
  // const session = await auth.api.getSession({
  //   headers: toHeaders(event.node.req.headers),
  // });

  // if (!session?.user) {
  //   throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  // }

  const body = await readBody(event);
  const userIds = normalizeUserIds((body as { userIds?: unknown } | null)?.userIds);

  if (!userIds) {
    throw createError({ statusCode: 400, statusMessage: "Invalid userIds" });
  }

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
    },
  });

  const userById = new Map(users.map((user) => [user.id, user]));
  const orderedUsers = userIds.map((id) => userById.get(id)).filter(Boolean);

  return { users: orderedUsers };
});
