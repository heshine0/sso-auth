import { defineEventHandler, createError, getRequestHeader } from "h3";
import { auth } from "../lib/auth";

export default defineEventHandler(async (event) => {
  const url = event.node.req.url;

  // Only protect /api/admin routes
  if (!url?.startsWith("/api/admin")) {
    return;
  }

  const session = await auth.api.getSession({
    headers: event.headers,
  });

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  if (session.user.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Not an admin",
    });
  }
});
