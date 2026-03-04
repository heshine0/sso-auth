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
const mockCreate = mock(() => Promise.resolve({}));
const mockUpdate = mock(() => Promise.resolve({}));
const mockDelete = mock(() => Promise.resolve({}));

mock.module("../server/lib/prisma", () => {
  return {
    default: {
      wechatMiniprogram: {
        findMany: mockFindMany,
        count: mockCount,
        create: mockCreate,
        update: mockUpdate,
        delete: mockDelete,
      },
    },
  };
});

// Import handlers
import listConfigs from "../server/api/admin/wechat-miniprograms/index.get";
import createConfig from "../server/api/admin/wechat-miniprograms/index.post";
import updateConfig from "../server/api/admin/wechat-miniprograms/[id].put";
import deleteConfig from "../server/api/admin/wechat-miniprograms/[id].delete";

describe("WeChat MiniProgram Management API", () => {
  beforeEach(() => {
    mockFindMany.mockClear();
    mockCount.mockClear();
    mockCreate.mockClear();
    mockUpdate.mockClear();
    mockDelete.mockClear();
  });

  describe("GET /wechat-miniprograms", () => {
    it("should list configs", async () => {
      mockCount.mockResolvedValue(1);
      mockFindMany.mockResolvedValue([{ id: 1, name: "Test App" }]);
      
      const event = createMockEvent({ query: { page: "1", pageSize: "10" } });
      const result = await listConfigs(event);
      
      expect(result).toEqual({ total: 1, items: [{ id: 1, name: "Test App" }] });
      expect(mockFindMany).toHaveBeenCalled();
    });
  });

  describe("POST /wechat-miniprograms", () => {
    it("should create config", async () => {
      const body = { name: "Test", appId: "wx123", appSecret: "secret", description: "desc" };
      const event = createMockEvent({ body });
      
      mockCreate.mockResolvedValue({ id: "1", ...body });
      
      const result = await createConfig(event);
      
      expect(mockCreate).toHaveBeenCalled();
      expect(result.id).toBe("1");
    });

    it("should throw error if missing fields", async () => {
      const event = createMockEvent({ body: { name: "Test" } }); // Missing appId
      try {
        await createConfig(event);
      } catch (e: any) {
        expect(e.statusCode).toBe(400);
      }
    });
  });

  describe("PUT /wechat-miniprograms/:id", () => {
    it("should update config", async () => {
      const body = { name: "Updated" };
      const event = createMockEvent({ 
        context: { params: { id: "1" } },
        body 
      });
      
      await updateConfig(event);
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe("DELETE /wechat-miniprograms/:id", () => {
    it("should delete config", async () => {
      const event = createMockEvent({ 
        context: { params: { id: "1" } }
      });
      
      await deleteConfig(event);
      expect(mockDelete).toHaveBeenCalled();
    });
  });
});
