import prisma from "../../../lib/prisma";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing ID" });
  }

  const body = await readBody(event);
  const { expiresAt, ipAddress, userAgent } = body;

  try {
    const session = await prisma.session.update({
      where: { id },
      data: {
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        ipAddress,
        userAgent,
      },
    });

    return session;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to update session",
    });
  }
});
