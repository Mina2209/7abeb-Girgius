import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const HymnService = {
  getAll: async () => {
    return prisma.hymn.findMany({
      include: { tags: true, files: true }
    });
  },

  getById: async (id) => {
    return prisma.hymn.findUnique({
      where: { id },
      include: { tags: true, files: true }
    });
  },

  create: async (data) => {
    return prisma.hymn.create({
      data: {
        title: data.title,
        files: data.files && data.files.length > 0 ? { create: data.files } : undefined,
        tags: data.tags && data.tags.length > 0
          ? {
              connectOrCreate: data.tags.map(tag => ({
                where: { name: tag },
                create: { name: tag }
              }))
            }
          : undefined
      },
      include: { tags: true, files: true }
    });
  },

  update: async (id, data) => {
    return prisma.hymn.update({
      where: { id },
      data: {
        title: data.title,
        // Replace files with the provided list (destructive: clears then recreates)
        files: {
          deleteMany: {},
          create: (data.files ?? [])
        },
        tags: {
          set: [], // clear old
          ...(data.tags && data.tags.length > 0
            ? {
                connectOrCreate: data.tags.map(tag => ({
                  where: { name: tag },
                  create: { name: tag }
                }))
              }
            : {})
        }
      },
      include: { tags: true, files: true }
    });
  },

  delete: async (id) => {
    return prisma.hymn.delete({
      where: { id }
    });
  }
};
