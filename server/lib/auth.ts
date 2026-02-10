import { betterAuth } from "better-auth/minimal";
// import { oauthProvider } from "@better-auth/oauth-provider";
import {  openAPI, phoneNumber } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { smsService, getTempEmail as makeTempEmail, getTempName as makeTempName } from "./sms";
import prisma from "./prisma";

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
            sendOTP: async ({ phoneNumber, code }) => {
                await smsService.sendOTP({ phoneNumber, code });
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
        openAPI()
    ]
});
