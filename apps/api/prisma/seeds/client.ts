import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  type Permission,
  type Prisma,
  type Role,
} from '../../src/generated/prisma/client.js';

export type SeedClient = Prisma.TransactionClient;
export type { Permission, Role };

export function createPrisma() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }, { schema: 'auth' }),
  });
}
