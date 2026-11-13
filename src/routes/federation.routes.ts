import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../config/db.js';
import { tenantResolverMiddleware } from '../middleware/tenant.middleware.js';
import { z } from 'zod';

const RegisterSubDaoSchema = z.object({
  slug: z.string().min(2).max(50),
  name: z.string().min(2),
  domain: z.string().optional(),
  storageUri: z.string().url(),
});

export async function federationRoutes(fastify: FastifyInstance) {
  // Public route to register a new Sub-DAO node
  fastify.post('/v1/subdaos', async (request: FastifyRequest, reply: FastifyReply) => {
    const validation = RegisterSubDaoSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.code(400).send({ status: 'error', details: validation.error.format() });
    }

    try {
      const newDao = await prisma.subDao.create({
        data: validation.data,
      });
      return reply.code(201).send({ status: 'success', data: newDao });
    } catch (error: any) {
      return reply.code(409).send({ status: 'error', message: 'Sub-DAO slug or domain already exists.' });
    }
  });

  // Protected tenant-scoped routes utilizing the tenant resolver middleware
  fastify.register(async (scopedInstance) => {
    scopedInstance.addHook('onRequest', tenantResolverMiddleware);

    scopedInstance.get('/v1/context', async (request: FastifyRequest, reply: FastifyReply) => {
      const tenant = (request as any).tenant;
      return {
        status: 'success',
        message: 'Sub-DAO context successfully resolved',
        activeTenant: tenant,
      };
    });
  });
}
