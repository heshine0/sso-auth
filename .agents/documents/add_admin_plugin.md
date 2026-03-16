# Plan: Add Admin Plugin to Better Auth Service

This plan outlines the steps to integrate the `admin` plugin into the existing Better Auth service, ensuring that only users with the 'admin' role can access admin pages, and refactoring the user management UI to utilize the admin plugin's API.

## Summary

The goal is to enable administrative features by adding the `admin` plugin to Better Auth. This involves updating the database schema, configuring server/client plugins, implementing role-based middleware, and refactoring the admin user management page to use `better-auth` admin APIs for listing, banning, and role management.

## Current State Analysis

-   **Database**: `prisma/schema.prisma` has a `User` model without `role`, `banned`, etc. fields.
-   **Auth Config**: `server/lib/auth.ts` uses `better-auth/minimal` without the `admin` plugin.
-   **Auth Client**: `app/utils/auth-client.ts` uses `createAuthClient` without the `adminClient` plugin.
-   **Middleware**: `server/middleware/admin-auth.ts` checks `ADMIN_EMAILS` env var.
-   **Admin Pages**: `app/pages/admin/users/index.vue` uses custom APIs (`/api/admin/users/*`) for all operations.

## Proposed Changes

### 1. Database Schema Update
-   Modify `prisma/schema.prisma`:
    -   Add `role String?` to `User` model.
    -   Add `banned Boolean?` to `User` model.
    -   Add `banReason String?` to `User` model.
    -   Add `banExpires DateTime?` to `User` model.
    -   Add `impersonatedBy String?` to `Session` model.

### 2. Database Migration
-   Run `bunx prisma migrate dev --name add_admin_fields` to apply schema changes.

### 3. Server-Side Auth Configuration
-   Update `server/lib/auth.ts`:
    -   Import `admin` from `better-auth/plugins`.
    -   Add `admin()` to the `plugins` array.

### 4. Client-Side Auth Configuration
-   Update `app/utils/auth-client.ts`:
    -   Import `adminClient` from `better-auth/client/plugins`.
    -   Add `adminClient()` to the `plugins` array in `createAuthClient`.

### 5. Client-Side Middleware
-   Create `app/middleware/admin.ts`:
    -   Check if user is logged in and has `role === 'admin'`.
    -   Redirect to `/` or `/login` if not authorized.
-   Apply middleware to all admin pages in `app/pages/admin/` using `definePageMeta`.

### 6. Server-Side Middleware Update
-   Update `server/middleware/admin-auth.ts`:
    -   Replace `ADMIN_EMAILS` check with `session.user.role === 'admin'`.

### 7. Refactor Admin User Management
-   Modify `app/pages/admin/users/index.vue`:
    -   **Listing**: Replace `useFetch('/api/admin/users')` with `authClient.admin.listUsers` (supports pagination & search).
    -   **Columns**: Add "Role" and "Banned" status to the table.
    -   **Actions**:
        -   **Delete**: Use `authClient.admin.removeUser`.
        -   **Role**: Add action to set role using `authClient.admin.setRole`.
        -   **Ban/Unban**: Add action to ban/unban using `authClient.admin.banUser` / `authClient.admin.unbanUser`.
    -   **Create/Edit**: Keep using custom APIs or `auth.api` equivalents if admin plugin lacks them (Admin plugin lacks generic create/update-profile).
        -   Ensure `create` endpoint handles the new schema if necessary.
        -   Ensure `update` endpoint doesn't conflict with role/ban management (or keep it for profile fields like name/email).

### 8. Cleanup Custom APIs (Optional)
-   If `authClient.admin.listUsers` replaces `server/api/admin/users/index.get.ts`, remove the custom GET endpoint.
-   If `authClient.admin.removeUser` replaces `server/api/admin/users/[id].delete.ts`, remove the custom DELETE endpoint.

### 9. Admin User Seeding
-   Create a script or use `prisma studio` to manually set the `role` of an existing user to 'admin'.

## Verification Plan

1.  **Schema & Config**: Verify DB fields and plugin setup.
2.  **Access Control**: Verify non-admins cannot access `/admin` or `/api/admin/*`.
3.  **User Management UI**:
    -   List users using the new API.
    -   Ban a user and verify they cannot log in.
    -   Unban a user and verify they can log in.
    -   Change a user's role and verify DB update.
    -   Delete a user and verify removal.
