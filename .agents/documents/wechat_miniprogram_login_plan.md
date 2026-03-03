# WeChat Mini Program Phone Number One-Click Login Implementation Plan

This plan outlines the steps to implement WeChat Mini Program phone number one-click login functionality, with support for multiple Mini Programs managed via the database.

## 1. Database Schema Design

We need to store configuration for multiple WeChat Mini Programs.

### 1.1 Update `prisma/schema.prisma`
Add a new model `WechatMiniprogram` to store app configurations.

```prisma
model WechatMiniprogram {
  id          String   @id @default(uuid())
  appId       String   @unique
  appSecret   String
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("wechat_miniprogram")
}
```

*Note: We will rely on the `User` table's `phoneNumber` field to link WeChat users to our system. If a user logs in with a phone number that exists, we log them in. If not, we create a new user.*

## 2. WeChat Service Implementation

Create a utility service to handle interactions with the WeChat API.

### 2.1 Create `server/lib/wechat.ts`
Implement the following functions:
- `getAccessToken(appId: string, appSecret: string)`: Fetches and caches the access token (using in-memory cache or DB/Redis if available).
- `getPhoneNumber(appId: string, code: string)`: Calls the WeChat `getuserphonenumber` API using the access token.
- `code2Session(appId: string, secret: string, jsCode: string)`: (Optional) For retrieving openid/unionid if needed later, but `getPhoneNumber` is sufficient for this task.

## 3. Better Auth Custom Plugin

Implement a custom plugin for `better-auth` to handle the WeChat login flow.

### 3.1 Create `server/plugins/wechat-auth.ts`
This plugin will:
- Define a custom endpoint: `POST /wechat/login`.
- Accept `appId` (to identify the Mini Program) and `code` (the phone number code from `getPhoneNumber` on the client).
- Logic:
    1.  Look up `WechatMiniprogram` by `appId`.
    2.  Call `WeChatService.getPhoneNumber` to get the verified phone number.
    3.  Check if a `User` exists with this phone number.
    4.  **If User Exists**: Create a session for this user.
    5.  **If User Does Not Exist**: Create a new user with the phone number (and generated email/name), then create a session.
    6.  Return the session and user info.

## 4. Integration

### 4.1 Update `server/lib/auth.ts`
- Import the `wechatAuth` plugin.
- Add it to the `plugins` array in the `betterAuth` configuration.

## 5. Migration & Seeding

### 5.1 Run Migrations
- Run `bunx prisma migrate dev --name add_wechat_miniprogram` to apply schema changes.

### 5.2 Seed Data
- Create a seed script (or use `prisma studio`) to add a test Mini Program configuration to the `wechat_miniprogram` table.

## 6. Verification

### 6.1 Mock Testing
- Since we cannot interact with real WeChat API without valid credentials and client code, we will mock the `WeChatService` methods during testing or provide a way to manually trigger the flow with mock data.
