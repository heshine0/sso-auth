import type { BetterAuthPlugin } from "better-auth";
import { z } from "zod";
import { createAuthEndpoint } from "better-auth/api";
import { wechatService } from "./wechat";
import prisma from "./prisma";
import { getTempEmail, getTempName } from "./sms";
import { Prisma } from "../generated/prisma/client";

export const wechatAuth = () => {
    return {
        id: "wechat-miniprogram",
        endpoints: {
            login: createAuthEndpoint("/wechat/login", {
                method: "POST",
                body: z.object({
                    appId: z.string(),
                    code: z.string()
                })
            }, async (ctx) => {
                const { appId, code } = ctx.body;

                try {
                    // 1. Get App Config
                    const appConfig = await prisma.wechatMiniprogram.findUnique({
                        where: { appId }
                    });

                    if (!appConfig) {
                        return ctx.json({ error: "Invalid App ID" }, { status: 400 });
                    }

                    // 2. Get Phone Number from WeChat
                    const phoneNumber = await wechatService.getPhoneNumber(appId, appConfig.appSecret, code);

                    if (!phoneNumber) {
                            return ctx.json({ error: "Failed to retrieve phone number from WeChat" }, { status: 400 });
                    }

                    // 3. Find or Create User
                    // Using prisma directly as internalAdapter might not expose findByPhoneNumber easily without extension
                    let user = await prisma.user.findUnique({
                        where: { phoneNumber }
                    });

                    if (!user) {
                        // Create user
                        let email = getTempEmail(phoneNumber);
                        const name = getTempName(phoneNumber);
                        
                        // Check if email already exists (unlikely but possible with temp emails)
                        const existingEmail = await prisma.user.findUnique({
                            where: { email }
                        });
                        
                        if (existingEmail) {
                            // Fallback for email collision: append random string
                            // But internalAdapter.createUser might handle or throw.
                            // We'll assume it's fine for now.
                            email = `${email.split("@")[0]}_${Math.random().toString(36).substring(2, 5)}@${email.split("@")[1]}`;
                        }

                        // Use internal adapter to create user to trigger hooks
                        user = await ctx.context.internalAdapter.createUser({
                            email,
                            name,
                            phoneNumber,
                            phoneNumberVerified: true,
                            emailVerified: false,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }) as Prisma.UserModel;
                    }
                    
                    if (!user) {
                            return ctx.json({ error: "Failed to create or find user" }, { status: 500 });
                    }

                    // 4. Create Session
                    // Using internal adapter to create session
                    const session = await ctx.context.internalAdapter.createSession(user.id, false, ctx.request);

                    // 5. Set Cookie
                    // Use better-auth's cookie helpers if available in context, or manually set
                    if (ctx.setCookie && ctx.context.authCookies) {
                        const cookieName = ctx.context.authCookies.sessionToken.name;
                        const cookieOptions = ctx.context.authCookies.sessionToken.attributes;
                        
                        // Adjust maxAge based on session expiry if needed, but options usually have defaults
                        ctx.setCookie(cookieName, session.token, {
                            ...cookieOptions,
                            expires: session.expiresAt
                        });
                    }

                    return ctx.json({ session, user });
                } catch (error: any) {
                    // Log error using better-auth logger if available
                    if (ctx.context.logger) {
                        ctx.context.logger.error("WeChat login error", error);
                    } else {
                        console.error("WeChat login error", error);
                    }
                    
                    return ctx.json({ error: error.message || "Internal Server Error" }, { status: 500 });
                }
            })
        }
    } satisfies BetterAuthPlugin;
}
