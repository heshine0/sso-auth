import prisma from "../../../lib/prisma";
import { randomUUID } from "node:crypto";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { userId, providerId, accountId, accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt, scope, password } = body;

  if (!userId || !providerId || !accountId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields: userId, providerId, accountId",
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

    const account = await prisma.account.create({
      data: {
        id: randomUUID(),
        userId,
        providerId,
        accountId,
        accessToken,
        refreshToken,
        accessTokenExpiresAt: accessTokenExpiresAt ? new Date(accessTokenExpiresAt) : null,
        refreshTokenExpiresAt: refreshTokenExpiresAt ? new Date(refreshTokenExpiresAt) : null,
        scope,
        password,
      },
    });

    return account;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to create account",
    });
  }
});
