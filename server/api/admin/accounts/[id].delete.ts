import prisma from "../../../lib/prisma";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing ID" });
  }

  try {
    await prisma.account.delete({
      where: { id },
    });
    return { success: true };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to delete account",
    });
  }
});
