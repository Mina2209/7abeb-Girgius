import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const region = process.env.AWS_REGION;
const bucket = process.env.AWS_S3_BUCKET;

// Optional prefix for S3 keys (e.g. 'Uploads/'). If set, ensure it ends with '/'.
const rawPrefix = process.env.S3_KEY_PREFIX || process.env.AWS_S3_PREFIX || 'Uploads/';
const S3_KEY_PREFIX = rawPrefix.endsWith('/') ? rawPrefix : `${rawPrefix}/`;

if (!bucket) {
  console.warn('AWS_S3_BUCKET is not set. S3 operations will fail without it.');
}

const s3 = new S3Client({ region });

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function getPresignedPutUrl({ filename, contentType, expiresIn = 900 }) {
  const key = `${S3_KEY_PREFIX}${Date.now()}-${Math.round(Math.random() * 1e9)}-${sanitizeFilename(filename)}`;
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  const url = await getSignedUrl(s3, command, { expiresIn });
  return { url, key, expiresIn };
}

export async function getPresignedGetUrl(key, expiresIn = 900) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const url = await getSignedUrl(s3, command, { expiresIn });
  return url;
}

export async function deleteObject(key) {
  const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
  return s3.send(command);
}

// Multipart upload helpers
export async function createMultipartUpload({ filename, contentType }) {
  const key = `${S3_KEY_PREFIX}${Date.now()}-${Math.round(Math.random() * 1e9)}-${sanitizeFilename(filename)}`;
  const command = new CreateMultipartUploadCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  const res = await s3.send(command);
  // res.UploadId
  return { key, uploadId: res.UploadId };
}

export async function getPresignedUploadPartUrl({ key, uploadId, partNumber, expiresIn = 3600 }) {
  const command = new UploadPartCommand({ Bucket: bucket, Key: key, UploadId: uploadId, PartNumber: partNumber });
  const url = await getSignedUrl(s3, command, { expiresIn });
  return url;
}

export async function completeMultipartUpload({ key, uploadId, parts }) {
  // parts: [{ ETag, PartNumber }]
  const command = new CompleteMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts }
  });
  return s3.send(command);
}

export async function abortMultipartUpload({ key, uploadId }) {
  const command = new AbortMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId });
  return s3.send(command);
}

export default {
  getPresignedPutUrl,
  getPresignedGetUrl,
  deleteObject,
  createMultipartUpload,
  getPresignedUploadPartUrl,
  completeMultipartUpload,
  abortMultipartUpload,
};
