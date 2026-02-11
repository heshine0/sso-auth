## Goal
- Implement a plain server-side REST endpoint that accepts `userIds[]` and returns only `id`, `name`, `image`, `email`.

## New Server API Route
- Add a Nitro route file: `server/api/users/list.post.ts`.
- Handler behavior:
  - Read JSON body via `readBody(event)`.
  - Validate `{ userIds: string[] }` (dedupe + cap size to avoid abuse).
  - Fetch the current session using Better Auth server APIs:
    - Convert Nitro request headers to a `Headers` object.
    - Call `auth.api.getSession({ headers })`.
    - If no session/user, return 401.
  - Query Prisma:
    - `prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, image: true, email: true } })`
    - Return `{ users: [...] }` (preserve input order where possible).

## Response Contract
- Endpoint: `POST /api/users/list`
- Body: `{ "userIds": ["...", "..."] }`
- Response: `{ "users": [{"id":"...","name":"...","image":null,"email":"..."}] }`

## Verification
- Start the dev server and validate:
  - Unauthenticated request returns 401.
  - Authenticated request returns only the allowed fields.
  - Large/invalid payloads return 400.

## Notes
- This stays fully independent from Better Auth’s plugin system while still reusing Better Auth for session validation.