import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// Factory to create an S3 service instance configured with region, bucket and prefix
export function createS3Service({ region, bucket, prefix = 'Uploads/' } = {}) {
  if (!bucket) {
    console.warn('AWS_S3_BUCKET is not set. S3 operations will fail without it.');
  }

  const s3 = new S3Client({ region });

  // Allow an explicit empty string to mean "no base prefix". If `prefix` is undefined use default.
  const rawPrefix = (typeof prefix === 'string') ? prefix : 'Uploads/';
  const S3_KEY_PREFIX = rawPrefix === '' ? '' : (rawPrefix.endsWith('/') ? rawPrefix : `${rawPrefix}/`);

  function buildKeyPrefix(folder) {
    if (!folder) return S3_KEY_PREFIX;
    // strip leading/trailing slashes from folder and append to base prefix
    const raw = String(folder);
    // If folder starts with '/' or a '!' marker treat as absolute (do not prepend base prefix)
    if (raw.startsWith('/') || raw.startsWith('!')) {
      const cleaned = raw.replace(/^[/!]+|\/+$/g, '');
      return `${cleaned}/`;
    }
    const cleaned = raw.replace(/^\/+|\/+$/g, '');
    return `${S3_KEY_PREFIX}${cleaned}/`;
  }

  return {
    async getPresignedPutUrl({ filename, contentType, folder, expiresIn = 900 } = {}) {
      const prefix = buildKeyPrefix(folder);
      const key = `${prefix}${Date.now()}-${Math.round(Math.random() * 1e9)}-${sanitizeFilename(filename)}`;
      const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
      const url = await getSignedUrl(s3, command, { expiresIn });
      return { url, key, expiresIn };
    },

    async getPresignedGetUrl(key, expiresIn = 900) {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const url = await getSignedUrl(s3, command, { expiresIn });
      return url;
    },

    async deleteObject(key) {
      const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
      return s3.send(command);
    },

    async createMultipartUpload({ filename, contentType, folder } = {}) {
      const prefix = buildKeyPrefix(folder);
      const key = `${prefix}${Date.now()}-${Math.round(Math.random() * 1e9)}-${sanitizeFilename(filename)}`;
      const command = new CreateMultipartUploadCommand({ Bucket: bucket, Key: key, ContentType: contentType });
      const res = await s3.send(command);
      return { key, uploadId: res.UploadId };
    },

    async getPresignedUploadPartUrl({ key, uploadId, partNumber, expiresIn = 3600 }) {
      const command = new UploadPartCommand({ Bucket: bucket, Key: key, UploadId: uploadId, PartNumber: partNumber });
      const url = await getSignedUrl(s3, command, { expiresIn });
      return url;
    },

    async completeMultipartUpload({ key, uploadId, parts }) {
      const command = new CompleteMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts }
      });
      return s3.send(command);
    },

    async abortMultipartUpload({ key, uploadId }) {
      const command = new AbortMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId });
      return s3.send(command);
    }
  };
}

// default instance configured from environment variables for backwards compatibility
const region = process.env.AWS_REGION;
const bucket = process.env.AWS_S3_BUCKET;
// Respect an explicitly set empty prefix. Use nullish coalescing so empty string is preserved.
const prefixEnv = process.env.S3_KEY_PREFIX ?? process.env.AWS_S3_PREFIX;
const prefixToUse = (typeof prefixEnv === 'string') ? prefixEnv : 'Uploads/';

const defaultService = createS3Service({ region, bucket, prefix: prefixToUse });

export default defaultService;
