import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { createMockEvent } from "./utils";

// Mock H3
mock.module("h3", () => {
  return {
    defineEventHandler: (handler: any) => handler,
    createError: (opts: any) => opts,
    getRequestHeader: () => {},
    getQuery: () => ({}),
    readBody: () => Promise.resolve({}),
  };
});

// Mock Auth
const mockGetSession = mock();
mock.module("../server/lib/auth", () => {
  return {
    auth: {
      api: {
        getSession: mockGetSession,
      },
    },
  };
});

// Import the middleware (it will use the mocks)
import adminAuthMiddleware from "../server/middleware/admin-auth";

describe("Admin Auth Middleware", () => {
  beforeEach(() => {
    mockGetSession.mockReset();
    process.env.ADMIN_EMAILS = "admin@example.com";
  });

  afterEach(() => {
    delete process.env.ADMIN_EMAILS;
  });

  it("should allow access if user is admin", async () => {
    mockGetSession.mockResolvedValue({
      user: { email: "admin@example.com" },
    });

    const event = createMockEvent({
      url: "/api/admin/users",
    });

    // Should not throw
    await adminAuthMiddleware(event);
    expect(mockGetSession).toHaveBeenCalled();
  });

  it("should deny access (403) if user is not admin", async () => {
    mockGetSession.mockResolvedValue({
      user: { email: "user@example.com" },
    });

    const event = createMockEvent({
      url: "/api/admin/users",
    });

    try {
      await adminAuthMiddleware(event);
      expect(true).toBe(false); // Should not reach here
    } catch (error: any) {
      expect(error.statusCode).toBe(403);
    }
  });

  it("should deny access (401) if not logged in", async () => {
    mockGetSession.mockResolvedValue(null);

    const event = createMockEvent({
      url: "/api/admin/users",
    });

    try {
      await adminAuthMiddleware(event);
      expect(true).toBe(false); // Should not reach here
    } catch (error: any) {
      expect(error.statusCode).toBe(401);
    }
  });

  it("should bypass non-admin routes", async () => {
    const event = createMockEvent({
      url: "/api/other",
    });

    await adminAuthMiddleware(event);
    expect(mockGetSession).not.toHaveBeenCalled();
  });
});
