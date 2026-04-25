import prisma from "../../lib/prisma";

// 最大用户ID数量限制
const MAX_USER_IDS = 500;

// 将对象转换为 HTTP Headers
const toHeaders = (input: Record<string, string | string[] | undefined>) => {
  const headers = new Headers();
  for (const [key, value] of Object.entries(input)) {
    if (!value) continue;
    if (Array.isArray(value)) {
      headers.set(key, value.join(","));
      continue;
    }
    headers.set(key, value);
  }
  return headers;
};

// 标准化用户ID数组：去重、过滤无效值、限制最大数量
const normalizeUserIds = (value: unknown) => {
  if (!Array.isArray(value)) return null;

  const seen = new Set<string>();
  const userIds: string[] = [];

  for (const item of value) {
    if (typeof item !== "string") return null;
    const id = item.trim();
    if (!id) return null;
    if (seen.has(id)) continue;
    seen.add(id);
    userIds.push(id);
    if (userIds.length > MAX_USER_IDS) return null;
  }

  return userIds;
};

/**
 * 根据用户ID列表查询用户信息
 * 
 * @method POST
 * @path /api/auth/list-users
 * 
 * @requestBody {
 *   userIds: string[]  // 用户ID数组，最多500个
 * }
 * 
 * @responseBody {
 *   users: Array<{
 *     id: string,      // 用户ID
 *     name: string,    // 用户名称
 *     image?: string,   // 用户头像URL
 *     phoneNumber?: string    // 用户手机号
 *     email?: string    // 用户邮箱
 *   }>
 * }
 * 
 * @example Request
 * {
 *   "userIds": ["user_123", "user_456", "user_789"]
 * }
 * 
 * @example Response
 * {
 *   "users": [
 *     { "id": "user_123", "name": "张三", "image": "https://...", "phoneNumber": "13800000000" },
 *     { "id": "user_456", "name": "李四", "image": "https://...", "phoneNumber": "13900000000" }
 *   ]
 * }
 * 
 * @error 400 Invalid userIds - 用户ID列表格式错误或超过数量限制
 */
export default defineEventHandler(async (event) => {
  // const session = await auth.api.getSession({
  //   headers: toHeaders(event.node.req.headers),
  // });

  // if (!session?.user) {
  //   throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  // }

  const body = await readBody(event);
  const userIds = normalizeUserIds((body as { userIds?: unknown } | null)?.userIds);

  // 验证用户ID列表是否有效
  if (!userIds) {
    throw createError({ statusCode: 400, statusMessage: "Invalid userIds" });
  }

  // 从数据库查询用户信息
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      name: true,
      image: true,
      phoneNumber: true,
    },
  });

  // 按照传入的userId顺序返回用户信息
  const userById = new Map(users.map((user) => [user.id, user]));
  const orderedUsers = userIds.map((id) => userById.get(id)).filter(Boolean);

  return { users: orderedUsers };
});
