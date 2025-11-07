import { TagService } from '../services/tag.service.js';

export const TagController = {
  getAll: async (req, res) => {
    const tags = await TagService.getAll();
    res.json(tags);
  },

  getById: async (req, res) => {
    const tag = await TagService.getById(req.params.id);
    if (!tag) return res.status(404).json({ error: 'Tag not found' });
    res.json(tag);
  },

  create: async (req, res) => {
    const tag = await TagService.create(req.body);
    res.status(201).json(tag);
  },

  update: async (req, res) => {
    const tag = await TagService.update(req.params.id, req.body);
    res.json(tag);
  },

  delete: async (req, res) => {
    await TagService.delete(req.params.id);
    res.status(204).send();
  }
};
