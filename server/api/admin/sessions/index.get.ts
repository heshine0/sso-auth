import prisma from "../../../lib/prisma";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = parseInt(query.page as string) || 1;
  const pageSize = parseInt(query.pageSize as string) || 10;
  const userId = query.userId as string;

  const where = userId ? { userId } : {};

  const [total, sessions] = await Promise.all([
    prisma.session.count({ where }),
    prisma.session.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, name: true } } }
    }),
  ]);

  return {
    total,
    sessions,
  };
});
