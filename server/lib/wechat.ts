import { createError } from "h3";

export const wechatService = {
    async getPhoneNumber(appId: string, appSecret: string, code: string): Promise<string> {
        try {
            // 1. Get Access Token
            const tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
            const tokenResponse: any = await $fetch(tokenUrl);

            if (tokenResponse.errcode && tokenResponse.errcode !== 0) {
                throw new Error(`WeChat Token Error: ${tokenResponse.errmsg}`);
            }

            const accessToken = tokenResponse.access_token;

            // 2. Get Phone Number
            const phoneUrl = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`;
            const phoneResponse: any = await $fetch(phoneUrl, {
                method: "POST",
                body: { code }
            });

            if (phoneResponse.errcode && phoneResponse.errcode !== 0) {
                 throw new Error(`WeChat Phone Error: ${phoneResponse.errmsg}`);
            }

            return phoneResponse.phone_info.phoneNumber;
        } catch (error: any) {
            console.error("WeChat Service Error:", error);
            throw createError({
                statusCode: 400,
                statusMessage: error.message || "Failed to get phone number from WeChat"
            });
        }
    }
};
