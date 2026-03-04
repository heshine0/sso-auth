import prisma from "../../../lib/prisma";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing ID" });
  }

  const body = await readBody(event);
  const { providerId, accountId, accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt, scope, password } = body;

  try {
    const account = await prisma.account.update({
      where: { id },
      data: {
        providerId,
        accountId,
        accessToken,
        refreshToken,
        accessTokenExpiresAt: accessTokenExpiresAt ? new Date(accessTokenExpiresAt) : undefined,
        refreshTokenExpiresAt: refreshTokenExpiresAt ? new Date(refreshTokenExpiresAt) : undefined,
        scope,
        password,
      },
    });
    return account;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to update account",
    });
  }
});
