import { Config } from '@alicloud/openapi-client';
import Dysmsapi20170525, { SendSmsRequest } from '@alicloud/dysmsapi20170525';

interface SendOTPOptions {
  phoneNumber: string;
  code: string;
}

export class SMSService {
  private client: Dysmsapi20170525;
  private signName: string;
  private templateCode: string;

  constructor() {
    const config = new Config({
      accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
      endpoint: 'dysmsapi.aliyuncs.com'
    });
    
    // Handle CJS/ESM interop issue where default export might be wrapped
    const Client = (Dysmsapi20170525 as any).default || Dysmsapi20170525;
    this.client = new Client(config);
    this.signName = process.env.ALIYUN_SMS_SIGN_NAME || '';
    this.templateCode = process.env.ALIYUN_SMS_TEMPLATE_CODE || '';
  }

  async sendOTP({ phoneNumber, code }: SendOTPOptions): Promise<boolean> {
    try {
      const request = new SendSmsRequest({
        phoneNumbers: phoneNumber,
        signName: this.signName,
        templateCode: this.templateCode,
        templateParam: JSON.stringify({ code }),
      });

      const response = await this.client.sendSms(request);
      // console.log('SMS response:', response);
      if (response.body && response.body.code === 'OK') {
        return true;
      }
      
      throw new Error(response.body?.message || 'Unknown error');
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error
    }
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export const smsService = new SMSService();

export function getTempEmail(phoneNumber: string) {
  return `phone_${phoneNumber.replace(/[^0-9]/g, "")}@sso-auth.local`;
}

export function getTempName(phoneNumber: string) {
  return `User ${phoneNumber.slice(-4)}`;
}
