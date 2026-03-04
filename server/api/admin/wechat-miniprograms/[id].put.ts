import prisma from "../../../lib/prisma";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing ID" });
  }

  const body = await readBody(event);
  const { appId, appSecret, name, description } = body;

  try {
    const item = await prisma.wechatMiniprogram.update({
      where: { id },
      data: {
        appId,
        appSecret,
        name,
        description,
      },
    });
    return item;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to update WeChat MiniProgram config",
    });
  }
});
