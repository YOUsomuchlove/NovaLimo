/**
 * Database CLI — run through Nx:
 *   nx run api-server:db -- migrate            apply pending migrations
 *   nx run api-server:db -- revert             revert the last migration
 *   nx run api-server:db -- generate AddFoo    diff entities vs DB → new migration file
 *   nx run api-server:db -- seed               idempotent reference + demo data (never in production)
 *   nx run api-server:db -- status
 * Reads DATABASE_URL from the environment / root .env.
 */
import 'reflect-metadata';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createDataSource } from '../src/database/data-source';
import { runSeed } from '../src/database/seed/seed';

function loadDotEnv() {
  const file = join(__dirname, '..', '..', '..', '.env');
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && process.env[m[1]] === undefined)
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

async function main() {
  loadDotEnv();
  const [cmd, name] = process.argv.slice(2);
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL chưa được đặt');
  const ds = createDataSource({
    DATABASE_URL: url,
    DATABASE_SSL: process.env.DATABASE_SSL === 'true',
    TYPEORM_LOGGING: false,
  });
  await ds.initialize();
  try {
    switch (cmd) {
      case 'migrate': {
        const ran = await ds.runMigrations({ transaction: 'each' });
        console.log(
          ran.length
            ? `✔ Applied: ${ran.map((m) => m.name).join(', ')}`
            : '✔ Schema is up to date',
        );
        break;
      }
      case 'revert':
        await ds.undoLastMigration({ transaction: 'each' });
        console.log('✔ Reverted last migration');
        break;
      case 'status': {
        const pending = await ds.showMigrations();
        console.log(
          pending
            ? '⚠ There are pending migrations'
            : '✔ No pending migrations',
        );
        break;
      }
      case 'generate': {
        if (!name || !/^[A-Z][A-Za-z0-9]+$/.test(name))
          throw new Error('Usage: generate PascalCaseName');
        const sql = await ds.driver.createSchemaBuilder().log();
        if (sql.upQueries.length === 0) {
          console.log('✔ Entities match the database — nothing to generate');
          break;
        }
        const ts = Date.now();
        const cls = `${name}${ts}`;
        const q = (s: string) =>
          '`' + s.replace(/`/g, '\\`').replace(/\$\{/g, '\\${') + '`';
        const up = sql.upQueries
          .map((x) => `    await queryRunner.query(${q(x.query)});`)
          .join('\n');
        const down = sql.downQueries
          .reverse()
          .map((x) => `    await queryRunner.query(${q(x.query)});`)
          .join('\n');
        const dir = join(__dirname, '..', 'src', 'database', 'migrations');
        const file = `${ts}-${name}.ts`;
        writeFileSync(
          join(dir, file),
          `import type { MigrationInterface, QueryRunner } from 'typeorm';\n\nexport class ${cls} implements MigrationInterface {\n  name = '${cls}';\n\n  async up(queryRunner: QueryRunner): Promise<void> {\n${up}\n  }\n\n  async down(queryRunner: QueryRunner): Promise<void> {\n${down}\n  }\n}\n`,
        );
        const indexFile = join(dir, 'index.ts');
        const index = readFileSync(indexFile, 'utf8')
          .replace(
            '// <imports>',
            `import { ${cls} } from './${file.replace(/\.ts$/, '')}';\n// <imports>`,
          )
          .replace('  // <migrations>', `  ${cls},\n  // <migrations>`);
        writeFileSync(indexFile, index);
        console.log(
          `✔ Created src/database/migrations/${file} (registered in index.ts)`,
        );
        break;
      }
      case 'seed':
        if (process.env.NODE_ENV === 'production')
          throw new Error('Seed bị chặn ở production');
        await runSeed(ds);
        console.log('✔ Seed done');
        break;
      default:
        throw new Error(
          `Unknown command "${cmd}". Use migrate | revert | status | generate <Name> | seed`,
        );
    }
  } finally {
    await ds.destroy();
  }
}

main().catch((e) => {
  console.error(`✖ ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
