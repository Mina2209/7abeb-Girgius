import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import s3Service from './s3.service.js';
const prisma = new PrismaClient();

// Resolve uploads directory relative to this file when UPLOADS_DIR is not set.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  // Determine uploads directory from env or fallback (resolve relative to this file so it's consistent
  // with the upload route which uses __dirname).
  const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');

    for (const file of hymn.files || []) {
      // try local disk removal (backwards compatibility)
      try {
        const parsed = new URL(file.fileUrl);
        const filename = path.basename(parsed.pathname);
        const filePath = path.join(uploadsDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          continue; // removed locally, continue to next file
        }
      } catch (err) {
        // not a local URL, proceed to s3/delete attempts
      }

      // If fileUrl is a server download endpoint like /api/uploads/url?key=<key>
      try {
        if (file.fileUrl && file.fileUrl.includes('key=')) {
          const parts = file.fileUrl.split('key=');
          const key = decodeURIComponent(parts[1] || '');
          if (key) {
            try {
              await s3Service.deleteObject(key);
              continue;
            } catch (e) {
              console.error('Failed to delete s3 object by key:', e.message || e);
            }
          }
        }
      } catch (e) {
        // ignore
      }

      // As a fallback, if fileUrl contains the bucket name or an S3 URL, try to extract key
      try {
        const bucket = process.env.AWS_S3_BUCKET;
        if (file.fileUrl && bucket && file.fileUrl.includes(bucket)) {
          const urlParts = file.fileUrl.split('/');
          const maybeKey = urlParts.slice(urlParts.indexOf(bucket) + 1).join('/');
          if (maybeKey) {
            try {
              await s3Service.deleteObject(maybeKey);
              continue;
            } catch (e) {
              console.error('Failed to delete s3 object by inferred key:', e.message || e);
            }
          }
        }
      } catch (e) {
        // ignore
      }
      // otherwise nothing else to do for this file
    }

    return prisma.hymn.delete({ where: { id } });
  }
};
