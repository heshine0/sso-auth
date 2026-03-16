import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
}

// extract postgres schema from DATABASE_URL, ?schema=public
const schemaMatch = databaseUrl?.match(/\bschema=([^&]+)/);
const schema = schemaMatch ? schemaMatch[1] : 'public';


const adapter = new PrismaPg({ connectionString: databaseUrl }, { schema });

export const prisma = globalForPrisma.prisma
    || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
