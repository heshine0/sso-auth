import { describe, it, expect, spyOn, mock, beforeAll, afterAll } from "bun:test";
import { wechatAuth } from "./wechat-auth-plugin";
import { wechatService } from "./wechat";
import prisma from "./prisma";

// Mock wechatService.getPhoneNumber
const getPhoneNumberSpy = spyOn(wechatService, "getPhoneNumber");

// Mock context
const mockInternalAdapter = {
    createUser: mock(async (data: any) => {
        return {
            id: "mock_user_id",
            ...data
        };
    }),
    createSession: mock(async (userId: string) => {
        return {
            token: "mock_session_token",
            expiresAt: new Date(Date.now() + 3600 * 1000),
            userId
        };
    })
};

const mockCtx = {
    body: {
        appId: "wx1234567890abcdef",
        code: "mock_code"
    },
    request: new Request("http://localhost"),
    json: (data: any) => data,
    setCookie: mock(),
    context: {
        internalAdapter: mockInternalAdapter,
        authCookies: {
            sessionToken: {
                name: "better-auth.session_token",
                options: {}
            }
        },
        logger: {
            error: mock()
        }
    }
};

describe("WeChat Auth Plugin", () => {
    
    // Mock Prisma for this test suite
    const mockFindUnique = mock();
    const mockCreate = mock();
    const mockDeleteMany = mock();
    
    // Override prisma with mocks
    (prisma as any).wechatMiniprogram = {
        findUnique: mockFindUnique,
        create: mockCreate,
        deleteMany: mockDeleteMany
    };
    (prisma as any).user = {
        findUnique: mock(() => Promise.resolve(null)), // Mock user not found initially
        deleteMany: mockDeleteMany
    };

    beforeAll(async () => {
        mockFindUnique.mockResolvedValue({
            appId: "wx1234567890abcdef",
            appSecret: "mock_secret",
            name: "Mock App"
        });
    });

    afterAll(async () => {
    });

    it("should login successfully with valid code", async () => {
        // Mock WeChat service response
        getPhoneNumberSpy.mockResolvedValue("13800138000");

        const plugin = wechatAuth();
        const handler = plugin.endpoints.login;

        const result: any = await handler(mockCtx as any);

        // Verify result
        expect(result.session).toBeDefined();
        expect(result.session.token).toBe("mock_session_token");
        expect(result.user.phoneNumber).toBe("13800138000");

        // Verify user creation (internal adapter called)
        expect(mockInternalAdapter.createUser).toHaveBeenCalled();
        const createArgs = mockInternalAdapter.createUser.mock.calls[0][0];
        expect(createArgs.phoneNumber).toBe("13800138000");

        getPhoneNumberSpy.mockRestore();
    });

    it("should return error if appId is invalid", async () => {
        // Mock findUnique to return null for invalid appId
        mockFindUnique.mockImplementation(async (args: any) => {
            if (args.where.appId === "invalid_app_id") return null;
            return {
                appId: "wx1234567890abcdef",
                appSecret: "mock_secret",
                name: "Mock App"
            };
        });

        const invalidCtx = { ...mockCtx, body: { appId: "invalid_app_id", code: "code" } };
        const plugin = wechatAuth();
        const handler = plugin.endpoints.login;

        const result: any = await handler(invalidCtx as any);
        expect(result.error).toBe("Invalid App ID");
    });
});
