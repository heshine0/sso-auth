import { betterAuth } from "better-auth/minimal";
// import { oauthProvider } from "@better-auth/oauth-provider";
import {  openAPI, phoneNumber } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { smsService, getTempEmail as makeTempEmail, getTempName as makeTempName } from "./sms";
import { wechatAuth } from "./wechat-auth-plugin";
import prisma from "./prisma";
import { statusCodes } from "better-auth";

export const auth = betterAuth({
    trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map(url => url.trim()) : [],
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    logger: {
        level: (process.env.BETTER_AUTH_LOG_LEVEL as "error" | "warn" | "info" | "debug") || "info",
        disabled: process.env.BETTER_AUTH_LOG_DISABLED === "true",
    },
    plugins: [
        phoneNumber({
            sendOTP: async ({ phoneNumber, code }, ctx) => {
                try {
                    await smsService.sendOTP({ phoneNumber, code });
                } catch (error:any) {
                    ctx!.setStatus(500);
                    ctx!.error(500, { message: error?.message || "Failed to send OTP" });
                }
            },
            signUpOnVerification: {
                getTempEmail: (phoneNumber) => {
                    return makeTempEmail(phoneNumber);
                },
                getTempName: (phoneNumber) => {
                    return makeTempName(phoneNumber);
                },
            },
            requireVerification: true,
            allowedAttempts: 5,
        }),
        // oauthProvider({
        //     loginPage: "/sign-in",
        //     consentPage: "/consent",
        // }),
        openAPI(),
        wechatAuth()
    ]
});
