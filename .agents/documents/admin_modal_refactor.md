# Admin Modal Refactor Plan

This plan aims to ensure that all admin pages use modals for Create and Edit operations, including adding these functionalities to pages that currently lack them (`Accounts` and `Sessions`).

## 1. Analysis & Verification

- [x] **Users (`/admin/users`)**: 
    - Verify existing Create/Edit implementation uses `UModal`. (Confirmed: Uses `showCreateModal` and `showEditModal`)
- [x] **WeChat MiniPrograms (`/admin/wechat-miniprograms`)**:
    - Verify existing Create/Edit implementation uses `UModal`. (Confirmed: Uses `showCreateModal` and `showEditModal`)
- [ ] **Accounts (`/admin/accounts`)**:
    - Currently only supports Delete (Unlink).
    - **Goal**: Add Create and Edit functionality using `UModal`.
- [ ] **Sessions (`/admin/sessions`)**:
    - Currently only supports Delete (Revoke).
    - **Goal**: Add Create and Edit functionality using `UModal`.

## 2. Backend Implementation

### Accounts API
- [ ] **Create Endpoint (`POST /api/admin/accounts`)**:
    - Accept `userId`, `providerId`, `accountId`, `accessToken`, `refreshToken`, `expiresAt`.
    - Use Prisma to create a new `Account` record.
    - Validate required fields.
- [ ] **Update Endpoint (`PUT /api/admin/accounts/:id`)**:
    - Accept fields to update (e.g., `accessToken`, `refreshToken`, `expiresAt`).
    - Use Prisma to update the `Account` record.

### Sessions API
- [ ] **Create Endpoint (`POST /api/admin/sessions`)**:
    - Accept `userId`, `userAgent`, `ipAddress`, `expiresAt`.
    - Generate a secure session token.
    - Use Prisma to create a new `Session` record.
- [ ] **Update Endpoint (`PUT /api/admin/sessions/:id`)**:
    - Accept fields to update (e.g., `expiresAt`, `userAgent`, `ipAddress`).
    - Use Prisma to update the `Session` record.

## 3. Frontend Implementation

### Accounts Page (`app/pages/admin/accounts/index.vue`)
- [ ] **Add Create Modal**:
    - Add "Link Account" button.
    - Implement `UModal` with form for `userId`, `providerId`, `accountId`.
    - Handle form submission to `POST /api/admin/accounts`.
- [ ] **Add Edit Modal**:
    - Add "Edit" button in table actions.
    - Implement `UModal` with form for editable fields.
    - Handle form submission to `PUT /api/admin/accounts/:id`.

### Sessions Page (`app/pages/admin/sessions/index.vue`)
- [ ] **Add Create Modal**:
    - Add "Create Session" button.
    - Implement `UModal` with form for `userId`, `expiresAt`.
    - Handle form submission to `POST /api/admin/sessions`.
- [ ] **Add Edit Modal**:
    - Add "Edit" button in table actions.
    - Implement `UModal` with form for editable fields.
    - Handle form submission to `PUT /api/admin/sessions/:id`.

## 4. Validation

- [ ] Verify that Create/Edit modals work correctly for `Accounts` and `Sessions`.
- [ ] Verify that existing functionality for `Users` and `WeChat MiniPrograms` remains intact.
