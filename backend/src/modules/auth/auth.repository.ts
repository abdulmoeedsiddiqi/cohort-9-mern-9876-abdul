import { prisma } from '../../lib/prisma';

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function createUser(data: { name: string; email: string; passwordHash: string }) {
  return prisma.user.create({ data });
}
