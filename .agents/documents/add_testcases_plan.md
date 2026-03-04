# Test Implementation Plan

This plan outlines the steps to add test cases for the Admin Panel APIs using `bun:test`.

## 1. Setup

-   Create a `tests` directory in the project root.
-   Create a `tests/utils.ts` helper file to mock H3 events and the Prisma client.

## 2. Test Cases

### 2.1 Admin Authentication Middleware
-   **File**: `tests/admin-auth.test.ts`
-   **Scenarios**:
    -   Should allow access if user email is in `ADMIN_EMAILS`.
    -   Should deny access (403) if user email is NOT in `ADMIN_EMAILS`.
    -   Should deny access (401) if no session exists.
    -   Should allow non-admin routes (bypass check).

### 2.2 User Management API
-   **File**: `tests/admin-users.test.ts`
-   **Scenarios**:
    -   `GET /api/admin/users`: Should return a paginated list of users.
    -   `POST /api/admin/users`: Should create a new user and handle errors (e.g., missing fields).
    -   `PUT /api/admin/users/:id`: Should update user details.
    -   `DELETE /api/admin/users/:id`: Should delete a user.

### 2.3 WeChat MiniProgram Management API
-   **File**: `tests/admin-wechat.test.ts`
-   **Scenarios**:
    -   `GET /api/admin/wechat-miniprograms`: Should return a list of configs.
    -   `POST /api/admin/wechat-miniprograms`: Should create a new config.
    -   `DELETE /api/admin/wechat-miniprograms/:id`: Should delete a config.

## 3. Implementation Details

-   Use `bun:test` for running tests.
-   Mock `prisma` calls to avoid hitting the real database during tests (or use a test database if preferred, but mocking is faster for unit tests).
-   Mock `better-auth` where necessary.

## 4. Execution

-   Run `bun test` to execute the test suite.
