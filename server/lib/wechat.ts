interface WechatAccessToken {
    access_token: string;
    expires_in: number;
    expires_at: number; // timestamp
}

// In-memory cache for access tokens: appId -> Token
const accessTokenCache = new Map<string, WechatAccessToken>();

export class WechatService {
    
    async getAccessToken(appId: string, appSecret: string): Promise<string> {
        // Check cache
        const cached = accessTokenCache.get(appId);
        if (cached && cached.expires_at > Date.now()) {
            return cached.access_token;
        }

        const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
        try {
            const response = await fetch(url);
            const data = await response.json() as any;

            if (data.errcode && data.errcode !== 0) {
                throw new Error(`WeChat API Error: ${data.errmsg} (code: ${data.errcode})`);
            }

            const token: WechatAccessToken = {
                access_token: data.access_token,
                expires_in: data.expires_in,
                expires_at: Date.now() + (data.expires_in - 300) * 1000 // Expire 5 minutes early to be safe
            };

            accessTokenCache.set(appId, token);
            return token.access_token;
        } catch (error) {
            console.error('Failed to fetch WeChat access token:', error);
            throw error;
        }
    }

    async getPhoneNumber(appId: string, appSecret: string, code: string): Promise<string> {
        const accessToken = await this.getAccessToken(appId, appSecret);
        const url = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code })
            });

            const data = await response.json() as any;

            if (data.errcode && data.errcode !== 0) {
                 // Potentially handle invalid access token (40001) by clearing cache and retrying
                 if (data.errcode === 40001) {
                     accessTokenCache.delete(appId);
                     // Retry logic could go here, but for simplicity we throw
                 }
                throw new Error(`WeChat API Error: ${data.errmsg} (code: ${data.errcode})`);
            }

            return data.phone_info.phoneNumber;
        } catch (error) {
            console.error('Failed to get WeChat phone number:', error);
            throw error;
        }
    }
}

export const wechatService = new WechatService();
