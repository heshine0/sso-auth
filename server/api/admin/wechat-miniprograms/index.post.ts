import prisma from "../../../lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { appId, appSecret, name, description } = body;

  if (!appId || !appSecret || !name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields",
    });
  }

  try {
    const item = await prisma.wechatMiniprogram.create({
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
      statusMessage: error.message || "Failed to create WeChat MiniProgram config",
    });
  }
});
