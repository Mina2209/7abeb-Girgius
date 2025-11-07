import { HymnService } from '../services/hymn.service.js';
import { normalizeArabic } from '../services/normalize.js';

export const HymnController = {
  getAll: async (req, res) => {
    const searchRaw = req.query.search || req.query.q || '';
    if (!searchRaw) {
      const hymns = await HymnService.getAll();
      return res.json(hymns);
    }

    const search = normalizeArabic(searchRaw);
    const hymns = await HymnService.getAll();
    const filtered = hymns.filter(h => {
      const title = normalizeArabic(h.title || '');
      if (title.includes(search)) return true;
      const tagMatch = Array.isArray(h.tags) && h.tags.some(t => normalizeArabic(t.name || '').includes(search));
      return tagMatch;
    });
    res.json(filtered);
  },

  getById: async (req, res) => {
    const hymn = await HymnService.getById(req.params.id);
    if (!hymn) return res.status(404).json({ error: 'Hymn not found' });
    res.json(hymn);
  },

  create: async (req, res) => {
    const hymn = await HymnService.create(req.body);
    res.status(201).json(hymn);
  },

  update: async (req, res) => {
    const hymn = await HymnService.update(req.params.id, req.body);
    res.json(hymn);
  },

  delete: async (req, res) => {
    await HymnService.delete(req.params.id);
    res.status(204).send();
  }
};
