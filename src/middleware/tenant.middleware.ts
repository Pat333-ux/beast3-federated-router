import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../config/db.js';

export async function tenantResolverMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Extract sub-DAO slug from custom header or host subdomain
    const tenantSlug = (request.headers['x-beast-subdao'] as string) || 'default';

    const subDao = await prisma.subDao.findUnique({
      where: { slug: tenantSlug },
    });

    if (!subDao || !subDao.isActive) {
      return reply.code(404).send({
        status: 'error',
        message: `Sub-DAO namespace '${tenantSlug}' not found or inactive.`,
      });
    }

    // Attach tenant context to the request object for subsequent route handlers
    (request as any).tenant = subDao;
  } catch (error: any) {
    request.log.error(error, '[TENANT-MIDDLEWARE] Resolution failure');
    return reply.code(500).send({ status: 'error', message: 'Internal tenant resolution error' });
  }
}
