import { LyricService } from '../services/lyric.service.js';
import { logService } from '../services/log.service.js';

export const LyricController = {
  /**
   * GET /api/lyrics
   * Get all lyrics, optionally filtered by hymnId query param
   */
  getAll: async (req, res) => {
    try {
      const { hymnId } = req.query;
      const lyrics = await LyricService.getAll(hymnId || null);
      res.json(lyrics);
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      res.status(500).json({ error: 'Failed to fetch lyrics' });
    }
  },

  /**
   * GET /api/lyrics/search?q=query
   * Full-text search across lyrics
   */
  search: async (req, res) => {
    try {
      const query = req.query.q || req.query.search || '';
      
      if (!query.trim()) {
        return res.json([]);
      }

      let results;
      try {
        // Try full-text search first
        results = await LyricService.search(query);
      } catch (error) {
        // Fallback to ILIKE search if full-text fails (e.g., search_vector column doesn't exist yet)
        console.warn('Full-text search failed, falling back to ILIKE:', error.message);
        results = await LyricService.searchFallback(query);
      }

      res.json(results);
    } catch (error) {
      console.error('Error searching lyrics:', error);
      res.status(500).json({ error: 'Failed to search lyrics' });
    }
  },

  /**
   * GET /api/lyrics/:id
   * Get a single lyric by ID
   */
  getById: async (req, res) => {
    try {
      const lyric = await LyricService.getById(req.params.id);
      if (!lyric) {
        return res.status(404).json({ error: 'Lyric not found' });
      }
      res.json(lyric);
    } catch (error) {
      console.error('Error fetching lyric:', error);
      res.status(500).json({ error: 'Failed to fetch lyric' });
    }
  },

  /**
   * GET /api/lyrics/hymn/:hymnId
   * Get all lyrics for a specific hymn
   */
  getByHymnId: async (req, res) => {
    try {
      const lyrics = await LyricService.getByHymnId(req.params.hymnId);
      res.json(lyrics);
    } catch (error) {
      console.error('Error fetching lyrics for hymn:', error);
      res.status(500).json({ error: 'Failed to fetch lyrics for hymn' });
    }
  },

  /**
   * POST /api/lyrics
   * Create a new lyric entry
   */
  create: async (req, res) => {
    try {
      const { hymnId, language, content, verseOrder } = req.body;

      if (!hymnId) {
        return res.status(400).json({ error: 'hymnId is required' });
      }
      if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'content is required' });
      }

      const lyric = await LyricService.create({
        hymnId,
        language,
        content,
        verseOrder
      });

      // Log the action if user is authenticated
      if (req.user) {
        await logService.createLog(
          req.user.id,
          'CREATE',
          'LYRIC',
          lyric.id,
          `Created lyric for hymn: ${lyric.hymn?.title || hymnId}`
        );
      }

      res.status(201).json(lyric);
    } catch (error) {
      console.error('Error creating lyric:', error);
      res.status(500).json({ error: 'Failed to create lyric' });
    }
  },

  /**
   * PUT /api/lyrics/:id
   * Update an existing lyric
   */
  update: async (req, res) => {
    try {
      const { language, content, verseOrder } = req.body;

      const lyric = await LyricService.update(req.params.id, {
        language,
        content,
        verseOrder
      });

      // Log the action if user is authenticated
      if (req.user) {
        await logService.createLog(
          req.user.id,
          'UPDATE',
          'LYRIC',
          lyric.id,
          `Updated lyric for hymn: ${lyric.hymn?.title || lyric.hymnId}`
        );
      }

      res.json(lyric);
    } catch (error) {
      console.error('Error updating lyric:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Lyric not found' });
      }
      res.status(500).json({ error: 'Failed to update lyric' });
    }
  },

  /**
   * DELETE /api/lyrics/:id
   * Delete a lyric by ID
   */
  delete: async (req, res) => {
    try {
      const lyric = await LyricService.getById(req.params.id);
      
      if (!lyric) {
        return res.status(404).json({ error: 'Lyric not found' });
      }

      await LyricService.delete(req.params.id);

      // Log the action if user is authenticated
      if (req.user) {
        await logService.createLog(
          req.user.id,
          'DELETE',
          'LYRIC',
          req.params.id,
          `Deleted lyric for hymn: ${lyric.hymn?.title || lyric.hymnId}`
        );
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting lyric:', error);
      res.status(500).json({ error: 'Failed to delete lyric' });
    }
  },

  /**
   * PUT /api/lyrics/hymn/:hymnId/bulk
   * Bulk create/update lyrics for a hymn (replaces all existing)
   */
  bulkUpsert: async (req, res) => {
    try {
      const { hymnId } = req.params;
      const { lyrics } = req.body;

      if (!Array.isArray(lyrics)) {
        return res.status(400).json({ error: 'lyrics must be an array' });
      }

      const result = await LyricService.bulkUpsertForHymn(hymnId, lyrics);

      // Log the action if user is authenticated
      if (req.user) {
        await logService.createLog(
          req.user.id,
          'BULK_UPDATE',
          'LYRIC',
          hymnId,
          `Bulk updated ${lyrics.length} lyrics for hymn`
        );
      }

      res.json(result);
    } catch (error) {
      console.error('Error bulk upserting lyrics:', error);
      res.status(500).json({ error: 'Failed to bulk update lyrics' });
    }
  }
};
