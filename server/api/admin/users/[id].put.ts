import prisma from "../../../lib/prisma";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing ID" });
  }

  const body = await readBody(event);
  const { name, email, phoneNumber, emailVerified, phoneNumberVerified } = body;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        phoneNumber,
        emailVerified,
        phoneNumberVerified,
      },
    });
    return user;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to update user",
    });
  }
});
