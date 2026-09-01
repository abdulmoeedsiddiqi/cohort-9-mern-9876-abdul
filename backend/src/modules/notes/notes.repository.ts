import type { NoteType, Prisma } from '@prisma/client';

import { prisma } from '../../lib/prisma';

interface ListOptions {
  userId: string;
  page: number;
  pageSize: number;
}

interface CreateNoteData {
  title: string;
  content?: unknown;
  type: NoteType;
  color: string;
  wordCount: number;
}

interface UpdateNoteData {
  title?: string;
  content?: unknown;
  type?: NoteType;
  color?: string;
  pinned?: boolean;
  wordCount?: number;
}

export function findManyForUser({ userId, page, pageSize }: ListOptions) {
  return prisma.note.findMany({
    where: { userId, deletedAt: null },
    orderBy: { updatedAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
}

export function countForUser(userId: string) {
  return prisma.note.count({ where: { userId, deletedAt: null } });
}

export function countPinnedForUser(userId: string) {
  return prisma.note.count({ where: { userId, deletedAt: null, pinned: true } });
}

export function countVideoForUser(userId: string) {
  return prisma.note.count({
    where: { userId, deletedAt: null, type: { in: ['VIDEO', 'MIXED'] } },
  });
}

export function countTrashForUser(userId: string) {
  return prisma.note.count({ where: { userId, deletedAt: { not: null } } });
}

export function findOneForUser(id: string, userId: string) {
  return prisma.note.findFirst({ where: { id, userId, deletedAt: null } });
}

export function findManyTrashForUser({ userId, page, pageSize }: ListOptions) {
  return prisma.note.findMany({
    where: { userId, deletedAt: { not: null } },
    orderBy: { deletedAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
}

export function findOneTrashedForUser(id: string, userId: string) {
  return prisma.note.findFirst({ where: { id, userId, deletedAt: { not: null } } });
}

export function create(userId: string, data: CreateNoteData) {
  return prisma.note.create({
    data: {
      userId,
      title: data.title,
      type: data.type,
      color: data.color,
      wordCount: data.wordCount,
      ...(data.content !== undefined ? { content: data.content as Prisma.InputJsonValue } : {}),
    },
  });
}

export function update(id: string, data: UpdateNoteData) {
  const { content, ...rest } = data;
  return prisma.note.update({
    where: { id },
    data: {
      ...rest,
      ...(content !== undefined ? { content: content as Prisma.InputJsonValue } : {}),
    },
  });
}

export function softDelete(id: string) {
  return prisma.note.update({ where: { id }, data: { deletedAt: new Date() } });
}

export function restore(id: string) {
  return prisma.note.update({ where: { id }, data: { deletedAt: null } });
}

export function purge(id: string) {
  return prisma.note.delete({ where: { id } });
}
