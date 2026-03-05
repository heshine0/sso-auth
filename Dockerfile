# Use the official Bun image
FROM oven/bun:1-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock* package-lock.json* /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Build stage
FROM base AS build
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# environment variables 
ENV NODE_ENV=production
ENV NITRO_PRESET=bun

# Generate Prisma Client
# This generates the client into server/generated/prisma as configured in schema.prisma
RUN bunx prisma generate

# Build the Nuxt application
RUN bun run build

# Release stage
FROM base AS release
WORKDIR /app

# Copy the built application
COPY --from=build /app/.output .output
# Copy generated prisma client/engine just in case it's needed at runtime
# This is important because schema.prisma defines a custom output location
# COPY --from=build /app/server/generated ./server/generated

# Copy prisma directory for migrations
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

# Set environment variables
ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
# Default port is 3000, can be overridden by -e PORT=8080
ENV PORT=8000

# Start the serverDATABASE_URL=postgresql://user:password@host:5432/db
# ENV BETTER_AUTH_SECRET=your_secret
# ENV BETTER_AUTH_URL=http://localhost:3000

# Start the server
CMD ["bun", "run", ".output/server/index.mjs"]
