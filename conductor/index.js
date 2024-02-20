import { startHttp } from './http.js';
import { db, last } from './db.js';
import { eq } from 'drizzle-orm';

async function checkSingleton(val) {
  const singleton = await db
    .select()
    .from(last)
    .where(eq(last.insOrDel, val));
  if (!singleton) {
    await db
      .insert()
      .values({
        singleton: val,
      });
  }
}

await Promise.all([
  checkSingleton(0),
  checkSingleton(1),
]);

await startHttp(8080);
console.log('HTTP ready');
