import { config } from 'dotenv';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

config({ path: path.resolve(process.cwd(), 'src/config/config.env') });

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error('DATABASE_URL is not set');
}

export default defineConfig({
  schema: 'prisma/models',
  migrations: {
    path: 'prisma/models/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url,
  },
});
