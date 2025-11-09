import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
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
    // Fetch hymn with files to remove uploaded files from disk first
    const hymn = await prisma.hymn.findUnique({ where: { id }, include: { files: true } });
    if (!hymn) return null;

    // Determine uploads directory from env or fallback
    const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'server', 'uploads');

    for (const file of hymn.files || []) {
      try {
        // file.fileUrl is expected to be a URL like http://host/uploads/<filename>
        const parsed = new URL(file.fileUrl);
        const filename = path.basename(parsed.pathname);
        const filePath = path.join(uploadsDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        // If fileUrl is not a valid URL, try to resolve as a plain filename
        try {
          const filename = path.basename(file.fileUrl || '');
          const filePath = path.join(uploadsDir, filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (e) {
          // swallow errors to avoid preventing DB deletion
          console.error('Failed to remove uploaded file:', e.message || e);
        }
      }
    }

    return prisma.hymn.delete({ where: { id } });
  }
};
