import prisma from "../../../lib/prisma";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = parseInt(query.page as string) || 1;
  const pageSize = parseInt(query.pageSize as string) || 10;
  const search = (query.search as string) || "";

  const where = search ? {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { appId: { contains: search, mode: 'insensitive' } },
    ],
  } : {};

  const [total, items] = await Promise.all([
    prisma.wechatMiniprogram.count({ where }),
    prisma.wechatMiniprogram.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    total,
    items,
  };
});
