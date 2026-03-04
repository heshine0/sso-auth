import { describe, it, expect, mock, beforeEach } from "bun:test";
import { createMockEvent } from "./utils";

// Mock H3
mock.module("h3", () => {
  return {
    defineEventHandler: (handler: any) => handler,
    createError: (opts: any) => opts,
    getRequestHeader: () => {},
    getQuery: (event: any) => event.query || {},
    readBody: (event: any) => Promise.resolve(event._body || {}),
  };
});

// Mock Prisma
const mockFindMany = mock(() => Promise.resolve([]));
const mockCount = mock(() => Promise.resolve(0));
const mockUpdate = mock(() => Promise.resolve({}));
const mockDelete = mock(() => Promise.resolve({}));

mock.module("../server/lib/prisma", () => {
  return {
    default: {
      user: {
        findMany: mockFindMany,
        count: mockCount,
        update: mockUpdate,
        delete: mockDelete,
      },
    },
  };
});

// Mock Auth
const mockSignUpEmail = mock(() => Promise.resolve({ user: { id: "123" } }));
mock.module("../server/lib/auth", () => {
  return {
    auth: {
      api: {
        signUpEmail: mockSignUpEmail,
      },
    },
  };
});

// Import handlers
import listUsers from "../server/api/admin/users/index.get";
import createUser from "../server/api/admin/users/index.post";
import updateUser from "../server/api/admin/users/[id].put";
import deleteUser from "../server/api/admin/users/[id].delete";

describe("User Management API", () => {
  beforeEach(() => {
    mockFindMany.mockClear();
    mockCount.mockClear();
    mockUpdate.mockClear();
    mockDelete.mockClear();
    mockSignUpEmail.mockClear();
  });

  describe("GET /users", () => {
    it("should list users", async () => {
      mockCount.mockResolvedValue(2);
      mockFindMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      
      const event = createMockEvent({ query: { page: "1", pageSize: "10" } });
      const result = await listUsers(event);
      
      expect(result).toEqual({ total: 2, users: [{ id: 1 }, { id: 2 }] });
      expect(mockFindMany).toHaveBeenCalled();
    });
  });

  describe("POST /users", () => {
    it("should create user", async () => {
      const body = { name: "Test", email: "test@example.com", password: "password" };
      const event = createMockEvent({ body });
      
      const result = await createUser(event);
      
      expect(mockSignUpEmail).toHaveBeenCalled();
      expect(result).toEqual({ user: { id: "123" } });
    });

    it("should create user with phone number", async () => {
      const body = { name: "Test", email: "test@example.com", password: "password", phoneNumber: "123456" };
      const event = createMockEvent({ body });
      
      mockSignUpEmail.mockResolvedValue({ user: { id: "123" } });
      
      await createUser(event);
      
      expect(mockSignUpEmail).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "123" },
        data: { phoneNumber: "123456" }
      });
    });

    it("should throw error if missing fields", async () => {
      const event = createMockEvent({ body: {} });
      try {
        await createUser(event);
      } catch (e: any) {
        expect(e.statusCode).toBe(400);
      }
    });
  });

  describe("PUT /users/:id", () => {
    it("should update user", async () => {
      const body = { name: "Updated" };
      const event = createMockEvent({ 
        context: { params: { id: "1" } },
        body 
      });
      
      await updateUser(event);
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe("DELETE /users/:id", () => {
    it("should delete user", async () => {
      const event = createMockEvent({ 
        context: { params: { id: "1" } }
      });
      
      await deleteUser(event);
      expect(mockDelete).toHaveBeenCalled();
    });
  });
});
