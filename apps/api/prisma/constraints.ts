import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import { config } from 'dotenv';
import { Client, DatabaseError } from 'pg';

config({ path: path.resolve(process.cwd(), 'src/config/config.env') });

const SQL_DIR = path.resolve(process.cwd(), 'prisma/sql');

/// Queried after the run so the summary reports what the database actually has,
/// rather than what the files claimed to add.
const DOMAIN_SCHEMAS = ['iam', 'restaurant', 'employee_meal'];

type Failure = { file: string; reason: string };

function explain(error: unknown): string {
  if (!(error instanceof DatabaseError)) {
    return error instanceof Error ? error.message : String(error);
  }

  const lines = [error.message];

  if (error.detail) lines.push(`detail: ${error.detail}`);
  if (error.table) lines.push(`table: ${error.table}`);

  if (error.code === '42P01') {
    lines.push('That table does not exist yet — run `prisma db push` first.');
  }

  if (error.code === '23514') {
    lines.push(
      'Existing rows violate this constraint. Either the rule is wrong or the ' +
        'data is; fix one and re-run.',
    );
  }

  if (error.code === '23503') {
    lines.push(
      'Existing rows point at a parent that does not satisfy this reference. ' +
        'For the same-owner tree keys, that means a subtree straddles two owners.',
    );
  }

  if (error.code === '23505') {
    lines.push('Existing rows are duplicated on the columns being made unique.');
  }

  return lines.join('\n    ');
}

/// Reported per type rather than as one number: the files add CHECKs, but also
/// the unique keys and composite foreign keys that enforce same-owner parentage.
/// Counting only CHECKs would leave those invisible in the very output meant to
/// confirm the database is protected.
const CONSTRAINT_KINDS = { c: 'check', f: 'foreign key', u: 'unique' } as const;

type ConstraintKind = keyof typeof CONSTRAINT_KINDS;

async function summarize(client: Client): Promise<void> {
  const { rows } = await client.query<{
    schema: string;
    kind: ConstraintKind;
    total: string;
  }>(
    `SELECT n.nspname AS schema, c.contype::text AS kind, count(*)::text AS total
       FROM pg_constraint c
       JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE c.contype = ANY($1::"char"[])
        AND n.nspname = ANY($2::text[])
      GROUP BY 1, 2
      ORDER BY 1, 2`,
    [Object.keys(CONSTRAINT_KINDS), DOMAIN_SCHEMAS],
  );

  const kinds = Object.keys(CONSTRAINT_KINDS) as ConstraintKind[];
  const perSchema = new Map<string, Map<ConstraintKind, number>>();

  for (const row of rows) {
    const counts = perSchema.get(row.schema) ?? new Map<ConstraintKind, number>();
    counts.set(row.kind, Number(row.total));
    perSchema.set(row.schema, counts);
  }

  const header = kinds.map((kind) => CONSTRAINT_KINDS[kind].padStart(12));
  console.log(`\nConstraints live in the database\n  ${''.padEnd(14)}${header.join('')}`);

  const totals = new Map<ConstraintKind, number>();

  for (const [schema, counts] of [...perSchema].sort()) {
    const cells = kinds.map((kind) => {
      const value = counts.get(kind) ?? 0;
      totals.set(kind, (totals.get(kind) ?? 0) + value);
      return String(value).padStart(12);
    });

    console.log(`  ${schema.padEnd(14)}${cells.join('')}`);
  }

  const totalCells = kinds.map((kind) =>
    String(totals.get(kind) ?? 0).padStart(12),
  );
  console.log(`  ${'total'.padEnd(14)}${totalCells.join('')}`);
}

async function listSqlFiles(directory: string): Promise<string[]> {
  try {
    const names = await readdir(directory);
    return names.filter((name) => name.endsWith('.sql')).sort();
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function applyConstraints(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set in src/config/config.env');
  }

  const files = await listSqlFiles(SQL_DIR);

  if (files.length === 0) {
    console.log('No extra SQL constraints to apply.');
    return;
  }

  const client = new Client({ connectionString });
  await client.connect();

  const failures: Failure[] = [];

  console.log(`Applying ${files.length} constraint files from prisma/sql\n`);

  try {
    for (const file of files) {
      const sql = await readFile(path.join(SQL_DIR, file), 'utf8');
      const added = sql.match(/ADD CONSTRAINT/g)?.length ?? 0;
      const label = `  ${file.padEnd(30)}${String(added).padStart(3)} added   `;

      // One transaction per file, so a failure rolls that file back whole
      // instead of leaving half its constraints applied. Postgres makes DDL
      // transactional, which is what lets this work.
      //
      // The file is sent as a single query rather than split on semicolons:
      // analytics and notification contain dollar-quoted plpgsql bodies whose
      // own semicolons would be cut in the wrong places.
      await client.query('BEGIN');

      try {
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`${label}ok`);
      } catch (error) {
        await client.query('ROLLBACK');
        failures.push({ file, reason: explain(error) });
        console.log(`${label}FAILED`);
      }
    }

    for (const { file, reason } of failures) {
      console.error(`\n${file}\n    ${reason}`);
    }

    await summarize(client);
  } finally {
    await client.end();
  }

  if (failures.length > 0) {
    console.error(
      `\n${failures.length} of ${files.length} files failed; those schemas are unprotected.`,
    );
    process.exitCode = 1;
  }
}

void applyConstraints();
