import Fastify from 'fastify';
import dotenv from 'dotenv';
import { federationRoutes } from './routes/federation.routes.js';

dotenv.config();

const fastify = Fastify({ logger: true });

// Register federation routes
fastify.register(federationRoutes);

fastify.get('/health', async () => {
  return { status: 'healthy', service: 'beast3-federated-router', timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 8083;
    const host = process.env.HOST || '0.0.0.0';
    await fastify.listen({ port, host });
    console.log(`[BEAST 3.0] beast3-federated-router active on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
