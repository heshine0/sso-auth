/**
 * 短信发送 API
 * 向指定手机号批量发送短信通知
 *
 * POST /api/sms/send
 *
 * 请求体:
 * {
 *   phoneNumbers: string[],   // 目标手机号数组
 *   templateCode: string,     // 阿里云短信模板CODE
 *   templateParam?: object    // 模板参数（可选）
 * }
 *
 * 响应:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     total: number,          // 总数量
 *     sent: number,           // 成功数量
 *     failed: number,         // 失败数量
 *     results: Array<{ phoneNumber: string, success: boolean, message?: string }>
 *   }
 * }
 */
import { smsService } from "#server/lib/sms";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { phoneNumbers, templateCode, templateParam } = body;

  if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "phoneNumbers is required and must be a non-empty array",
    });
  }

  if (!templateCode || typeof templateCode !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "templateCode is required and must be a string",
    });
  }

  try {
    const result = await smsService.sendNotification({
      phoneNumbers,
      templateCode,
      templateParam,
    });

    return {
      success: result.success,
      message: result.success ? "短信发送完成" : "部分短信发送失败",
      data: {
        total: result.total,
        sent: result.sent,
        failed: result.failed,
        results: result.results,
      },
    };
  } catch (error: any) {
    console.error("Error sending SMS notification:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to send SMS notification",
    });
  }
});