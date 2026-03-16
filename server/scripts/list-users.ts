import prisma from "../lib/prisma";

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("Users:", users);
  } catch (error) {
    console.error(`Failed to list users: ${error}`);
  } finally {
    // prisma.$disconnect() might not be available if it's using adapter? 
    // But usually it is.
    // However, if imported from server/lib/prisma, it's a singleton.
    // We can just exit.
    process.exit(0);
  }
}

main();
