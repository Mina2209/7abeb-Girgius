import { Router } from 'express';
import * as s3Service from '../services/s3.service.js';
import auth from '../middleware/auth.js';

const router = Router();

// Request a presigned PUT URL for uploading directly to S3
// body: { filename, contentType }
router.post('/presign', async (req, res) => {
  try {
    const { filename, contentType } = req.body || {};
    if (!filename || !contentType) return res.status(400).json({ error: 'filename and contentType required' });
    const result = await s3Service.getPresignedPutUrl({ filename, contentType });
    // return the presigned url and the object key
    res.json(result);
  } catch (err) {
    console.error('Failed to create presigned url', err);
    res.status(500).json({ error: 'Failed to create presigned url' });
  }
});

// Redirect to a presigned GET URL so frontend can download via a stable API URL
// query: ?key=objectKey
router.get('/url', async (req, res) => {
  try {
    const { key } = req.query;
    if (!key) return res.status(400).send('key required');
    const url = await s3Service.getPresignedGetUrl(key);
    // redirect browser to S3 presigned URL
    res.redirect(url);
  } catch (err) {
    console.error('Failed to create presigned get url', err);
    res.status(500).send('Failed to create download url');
  }
});

// Delete an object from S3. Accepts key in URL param or body.
router.delete('/:key', auth, async (req, res) => {
  try {
    const key = req.params.key || req.body?.key;
    if (!key) return res.status(400).json({ error: 'key required' });
    await s3Service.deleteObject(key);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete object', err);
    res.status(500).json({ error: 'Failed to delete object' });
  }
});

// Multipart upload endpoints
// Initiate multipart upload -> returns { key, uploadId }
router.post('/multipart/initiate', async (req, res) => {
  try {
    const { filename, contentType } = req.body || {};
    if (!filename || !contentType) return res.status(400).json({ error: 'filename and contentType required' });
    const result = await s3Service.createMultipartUpload({ filename, contentType });
    res.json(result);
  } catch (err) {
    console.error('Failed to initiate multipart upload', err);
    res.status(500).json({ error: 'Failed to initiate multipart upload' });
  }
});

// Presign a specific part for multipart upload
router.post('/multipart/presign-part', async (req, res) => {
  try {
    const { key, uploadId, partNumber } = req.body || {};
    if (!key || !uploadId || !partNumber) return res.status(400).json({ error: 'key, uploadId and partNumber required' });
    const url = await s3Service.getPresignedUploadPartUrl({ key, uploadId, partNumber });
    res.json({ url });
  } catch (err) {
    console.error('Failed to presign part', err);
    res.status(500).json({ error: 'Failed to presign part' });
  }
});

// Complete multipart upload
router.post('/multipart/complete', async (req, res) => {
  try {
    const { key, uploadId, parts } = req.body || {};
    if (!key || !uploadId || !parts) return res.status(400).json({ error: 'key, uploadId and parts required' });
    const result = await s3Service.completeMultipartUpload({ key, uploadId, parts });
    res.json(result);
  } catch (err) {
    console.error('Failed to complete multipart upload', err);
    res.status(500).json({ error: 'Failed to complete multipart upload' });
  }
});

// Abort multipart upload
router.post('/multipart/abort', async (req, res) => {
  try {
    const { key, uploadId } = req.body || {};
    if (!key || !uploadId) return res.status(400).json({ error: 'key and uploadId required' });
    const result = await s3Service.abortMultipartUpload({ key, uploadId });
    res.json(result);
  } catch (err) {
    console.error('Failed to abort multipart upload', err);
    res.status(500).json({ error: 'Failed to abort multipart upload' });
  }
});

export default router;
