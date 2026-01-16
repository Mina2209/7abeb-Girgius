import { PrismaClient } from '@prisma/client';
import { normalizeArabic } from './normalize.js';

const prisma = new PrismaClient();

export const LyricService = {
  /**
   * Get all lyrics (optionally filtered by hymnId) This is useful if there is a Hymn with multiple lyrics in different languages.
   */
  getAll: async (hymnId = null) => {
    const where = hymnId ? { hymnId } : {};
    return prisma.lyric.findMany({
      where,
      include: { hymn: { select: { id: true, title: true } } },
      orderBy: [{ hymnId: 'asc' }, { verseOrder: 'asc' }]
    });
  },

  /**
   * Get a single lyric by ID
   */
  getById: async (id) => {
    return prisma.lyric.findUnique({
      where: { id },
      include: { hymn: { select: { id: true, title: true } } }
    });
  },

  /**
   * Get all lyrics for a specific hymn
   */
  getByHymnId: async (hymnId) => {
    return prisma.lyric.findMany({
      where: { hymnId },
      orderBy: { verseOrder: 'asc' }
    });
  },

  /**
   * Create a new lyric entry
   */
  create: async (data) => {
    return prisma.lyric.create({
      data: {
        hymnId: data.hymnId,
        language: data.language || 'ar',
        content: data.content,
        verseOrder: data.verseOrder ?? 0
      },
      include: { hymn: { select: { id: true, title: true } } }
    });
  },

  /**
   * Update an existing lyric
   */
  update: async (id, data) => {
    const updateData = {};
    if (data.language !== undefined) updateData.language = data.language;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.verseOrder !== undefined) updateData.verseOrder = data.verseOrder;

    return prisma.lyric.update({
      where: { id },
      data: updateData,
      include: { hymn: { select: { id: true, title: true } } }
    });
  },

  /**
   * Delete a lyric by ID
   */
  delete: async (id) => {
    return prisma.lyric.delete({ where: { id } });
  },

  /**
   * Delete all lyrics for a specific hymn
   */
  deleteByHymnId: async (hymnId) => {
    return prisma.lyric.deleteMany({ where: { hymnId } });
  },

  /**
   * Full-text search across lyrics content
   * Uses PostgreSQL's to_tsvector/to_tsquery for efficient searching
   */
  search: async (query) => {
    if (!query || query.trim() === '') {
      return [];
    }

    const normalizedQuery = normalizeArabic(query);
    
    // Use raw SQL for full-text search with the GIN index
    // The search_vector column is automatically maintained by PostgreSQL
    const results = await prisma.$queryRaw`
      SELECT l.*, h.title as "hymnTitle"
      FROM "Lyric" l
      JOIN "Hymn" h ON l."hymnId" = h.id
      WHERE l.search_vector @@ plainto_tsquery('simple', ${normalizedQuery})
      ORDER BY ts_rank(l.search_vector, plainto_tsquery('simple', ${normalizedQuery})) DESC
    `;

    return results;
  },

  /**
   * Fallback search using ILIKE (for when full-text search isn't suitable)
   */
  searchFallback: async (query) => {
    if (!query || query.trim() === '') {
      return [];
    }

    const normalizedQuery = normalizeArabic(query);
    
    return prisma.lyric.findMany({
      where: {
        content: {
          contains: normalizedQuery,
          mode: 'insensitive'
        }
      },
      include: { hymn: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' }
    });
  },

  /**
   * Bulk create/update lyrics for a hymn (replaces all existing lyrics)
   */
  bulkUpsertForHymn: async (hymnId, lyrics) => {
    // Delete existing lyrics for this hymn
    await prisma.lyric.deleteMany({ where: { hymnId } });

    // Create new lyrics
    if (lyrics && lyrics.length > 0) {
      const createData = lyrics.map((lyric, index) => ({
        hymnId,
        language: lyric.language || 'ar',
        content: lyric.content,
        verseOrder: lyric.verseOrder ?? index
      }));

      await prisma.lyric.createMany({ data: createData });
    }

    // Return the newly created lyrics
    return prisma.lyric.findMany({
      where: { hymnId },
      orderBy: { verseOrder: 'asc' }
    });
  }
};
