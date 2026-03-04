# Project Context

This is an SSO login service built with the `better-auth` library. It serves as a centralized user management system that other applications can utilize for authentication and authorization.

## Tech Stack
- **Framework**: Nuxt 4
- **Language**: TypeScript
- **Database**: PostgreSQL with **Prisma** ORM
- **UI Components**: Nuxt UI  @docs [nuxt-ui-llms-full.txt](./nuxt-ui-llms-full.txt)
- **Styling**:  Tailwind CSS
- **Authentication**: better-auth library
- **bundler**: bun (https://bun.sh/)

## Documentation
For detailed framework documentation, refer to the following local context files:
- **Nuxt 4**: [nuxt-llms.txt](file:./nuxt-llms.txt) (or https://nuxt.com/llms.txt)
- **better-auth**: [better-auth-llms.txt](file:./better-auth-llms.txt) (or https://better-auth.com/llms.txt)


## Coding Guidelines

### Vue/Nuxt
- Use `<script setup lang="ts">` for components.
- Utilize Nuxt's auto-imports feature (don't manually import Vue/Nuxt composables unless necessary).
- Follow the file-based routing conventions in `pages/`.
- Use `server/api` for backend API routes.

### General
- Write clean, concise, and type-safe code.
- Prefer functional programming patterns where appropriate.
- Handle errors gracefully, especially in async operations.
