import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { char } from 'drizzle-orm/mysql-core';
import { text, integer, sqliteTable, blob } from 'drizzle-orm/sqlite-core';

const sqlite = new Database(':memory:');
const db = drizzle(sqlite);

export const childrenTable = sqliteTable('children', {
  ip: blob('ip', { mode: 'buffer' }).primaryKey(),
  existsSince: integer('exists_since', { mode: 'timestamp' }).notNull(),
  goneSince: integer('gone_since', { mode: 'timestamp' }),
  lastPort: integer('last_port').notNull(),
});

export const last = sqliteTable('last', {
  insOrDel: integer('ins_or_del', { mode: 'boolean' }).primaryKey(), // 0: last deletion; 1: last insersion
  at: integer('at', { mode: 'timestamp' }),
});

export { db };
