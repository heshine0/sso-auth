import prisma from "../../../lib/prisma";
import { auth } from "../../../lib/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password, name, phoneNumber, role } = body;

  if (!email || !password || !name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields",
    });
  }

  // Use better-auth internal adapter to create user to handle password hashing
  try {
    const user = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      }
    });
    
    // If phoneNumber or role is provided, update it directly
    if ((phoneNumber || role) && user?.user?.id) {
       await prisma.user.update({
         where: { id: user.user.id },
         data: { 
           ...(phoneNumber && { phoneNumber }),
           ...(role && { role })
         }
       });
    }

    return user;
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message || "Failed to create user",
    });
  }
});
