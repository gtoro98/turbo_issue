import Fastify, { FastifyInstance } from 'fastify';
import mongoose from 'mongoose';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import config from '@/plugins/config';


export async function createServer() {
  let connection: typeof mongoose | null = null;
  try {
    connection = await mongoose
      .connect(String(process.env.DATABASE))
      .then((conn) => {
        console.log('Connected to database');
        return conn;
      });

    mongoose.connection.on('error', (err) => `❌🤬❌🤬 ${err}`);
  } catch (err) {
    console.log(`ERROR: ${err}`);
    if (connection && connection.connection) {
      connection.connection.close();
    }
    process.exit(1);
  }

  const server = Fastify({
    ajv: {
      customOptions: {
        removeAdditional: 'all',
        coerceTypes: true,
        useDefaults: true,
      },
    },
    logger: {
      level: process.env.LOG_LEVEL,
    },
  });
  //await server.register(fastifyExpress);
  //await server.use(createMiddleware(client));
  // const middleware = createMiddleware(client);
  // await server.addHook('preHandler', middleware);

  await server.register(config);
  await server.register(rateLimit);
  if (process.env.NODE_ENV === 'production') {
    await server.register(helmet);
  }
  await server.register(cors);

  await server.ready();

  return server;
}
