import prisma from "../server/lib/prisma";

async function main() {
  console.log("Prisma keys:", Object.keys(prisma));
  // Check if wechatMiniprogram exists on prisma instance (it might be hidden by proxy, so check constructor or dmmf)
  // But logging keys usually works for models on instance.
  
  const appId = "wx1234567890abcdef";
  const appSecret = "mock_secret_1234567890abcdef";

  const existing = await prisma.wechatMiniprogram.findUnique({
    where: { appId },
  });

  if (!existing) {
    await prisma.wechatMiniprogram.create({
      data: {
        appId,
        appSecret,
        name: "Mock Mini Program",
        description: "A mock mini program for testing",
      },
    });
    console.log(`Created mock Mini Program with AppID: ${appId}`);
  } else {
    console.log(`Mock Mini Program with AppID: ${appId} already exists.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
