import prisma from "../../../lib/prisma";
import { randomUUID, randomBytes } from "node:crypto";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { userId, expiresAt, ipAddress, userAgent } = body;

  if (!userId || !expiresAt) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields: userId, expiresAt",
    });
  }

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    const session = await prisma.session.create({
      data: {
        id: randomUUID(),
        token: randomBytes(32).toString('hex'), // Generate a secure token
        userId,
        expiresAt: new Date(expiresAt),
        ipAddress,
        userAgent,
      },
    });

    return session;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to create session",
    });
  }
});
