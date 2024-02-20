import Fastify from 'fastify';
import { db, childrenTable } from './db';

import { isNull, lt } from 'drizzle-orm';

export function startHttp(port) {
  const fastify = Fastify({});

  fastify.get('/registry', async (req, res) => {
    const previousSecond = Math.floor(Date.now() / 1000);
    const result = await db
      .select()
      .from(childrenTable)
      .where(and(
        lt(childrenTable.existsSince, previousSecond),
        isNull(childrenTable.goneSince),
      ));

    res.json(result.map(({ ip }) => ip));
  });

  return new Promise((mountRes, mountRej) => {
    fastify.listen({
      port,
      host: '0.0.0.0',
    }, (err) => {
      if (err) return mountRej(err);

      // Unmount
      mountRes((umountRes) => {
        fastify.close(() => umountRes());
      });
    });
  });
}
