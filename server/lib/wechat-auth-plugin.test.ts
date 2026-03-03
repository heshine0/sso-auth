import { describe, it, expect, spyOn, mock, beforeAll, afterAll } from "bun:test";
import { wechatAuth } from "./wechat-auth-plugin";
import { wechatService } from "./wechat";
import prisma from "./prisma";

// Mock internal adapter methods since we don't have the full better-auth context set up in this unit test
const mockInternalAdapter = {
    createUser: mock(async (data: any) => ({ ...data, id: "new_user_id" })),
    createSession: mock(async (userId: string) => ({ token: "mock_session_token", expiresAt: new Date(), userId })),
    findUserByPhoneNumber: mock(async () => null), // Not used in plugin directly anymore
};

const mockCtx = {
    body: {
        appId: "wx1234567890abcdef",
        code: "mock_code"
    },
    json: (data: any, opts: any) => ({ data, opts }),
    setCookie: mock(),
    context: {
        internalAdapter: mockInternalAdapter,
        authCookies: {
            sessionToken: {
                name: "better-auth.session_token",
                options: { httpOnly: true }
            }
        },
        logger: {
            error: console.error
        }
    },
    request: new Request("http://localhost/wechat/login", { method: "POST" })
};

describe("WeChat Auth Plugin", () => {
    
    beforeAll(async () => {
        // Ensure seed data exists
        const appId = "wx1234567890abcdef";
        const existing = await prisma.wechatMiniprogram.findUnique({ where: { appId } });
        if (!existing) {
             await prisma.wechatMiniprogram.create({
                data: {
                    appId,
                    appSecret: "mock_secret_1234567890abcdef",
                    name: "Mock Mini Program"
                }
             });
        }
    });

    afterAll(async () => {
        // Cleanup created user if any (optional)
        await prisma.user.deleteMany({ where: { phoneNumber: "13800138000" } });
    });

    it("should login successfully and create a new user", async () => {
        // Mock WeChat Service response
        const getPhoneNumberSpy = spyOn(wechatService, "getPhoneNumber").mockResolvedValue("13800138000");

        const plugin = wechatAuth();
        const handler = plugin.endpoints.login;

        const result: any = await handler(mockCtx as any);

        // Verify WeChat Service was called with correct args
        expect(getPhoneNumberSpy).toHaveBeenCalled();
        expect(getPhoneNumberSpy.mock.calls[0]).toEqual(["wx1234567890abcdef", "mock_secret_1234567890abcdef", "mock_code"]);

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
});
