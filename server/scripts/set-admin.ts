import prisma from "../lib/prisma";

async function main() {
  const email = process.argv[2];
  const role = process.argv[3] || "admin"; // Default to 'admin' if no role is provided

  if (!email) {
    console.error("Please provide an email address as an argument.");
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role },
    });
    console.log(`User ${user.email} now has the role: ${user.role}.`);
  } catch (error) {
    console.error(`Failed to update user: ${error}`);
  } finally {
    process.exit(0);
  }
}

main();
