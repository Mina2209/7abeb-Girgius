import { API_BASE } from '../config/apiConfig';

// Helper to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Helper for upload-related API calls (presign, delete)
export async function presign(filename, contentType, folderOrType) {
  const body = { filename, contentType };
  if (folderOrType) body.folder = folderOrType;
  const res = await fetch(`${API_BASE}/uploads/presign`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to get presigned url');
  return res.json();
}

// Multipart helpers
export async function initiateMultipart(filename, contentType, folderOrType) {
  const body = { filename, contentType };
  if (folderOrType) body.folder = folderOrType;
  const res = await fetch(`${API_BASE}/uploads/multipart/initiate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to initiate multipart');
  return res.json();
}

export async function presignPart({ key, uploadId, partNumber }) {
  const res = await fetch(`${API_BASE}/uploads/multipart/presign-part`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ key, uploadId, partNumber }),
  });
  if (!res.ok) throw new Error('Failed to presign part');
  return res.json();
}

export async function completeMultipart({ key, uploadId, parts }) {
  const res = await fetch(`${API_BASE}/uploads/multipart/complete`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ key, uploadId, parts }),
  });
  if (!res.ok) throw new Error('Failed to complete multipart');
  return res.json();
}

export async function abortMultipart({ key, uploadId }) {
  const res = await fetch(`${API_BASE}/uploads/multipart/abort`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ key, uploadId }),
  });
  if (!res.ok) throw new Error('Failed to abort multipart');
  return res.json();
}

// High level: upload large file using multipart. onProgress receives percent (0-100)
export async function uploadLargeFile(file, onProgress = () => {}, folderOrType) {
  const MIN_PART_SIZE = 5 * 1024 * 1024; // 5MB minimum per S3 rules
  const PART_SIZE = 10 * 1024 * 1024; // 10MB per part

  const { key, uploadId } = await initiateMultipart(file.name, file.type, folderOrType);
  const partsCount = Math.ceil(file.size / PART_SIZE);
  const parts = [];
  let uploadedBytes = 0;

  for (let partNumber = 1; partNumber <= partsCount; partNumber++) {
    const start = (partNumber - 1) * PART_SIZE;
    const end = Math.min(start + PART_SIZE, file.size);
    const blob = file.slice(start, end);
    const { url } = await presignPart({ key, uploadId, partNumber });

    // upload part via XMLHttpRequest to track progress
    const etag = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // ETag header should be present
          const et = xhr.getResponseHeader('ETag') || xhr.getResponseHeader('etag');
          resolve(et || xhr.responseText || '');
        } else {
          reject(new Error('Part upload failed'));
        }
      };
      xhr.onerror = () => reject(new Error('Part upload error'));
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const prevUploaded = uploadedBytes;
          const partUploaded = e.loaded;
          const totalUploaded = prevUploaded + partUploaded;
          const percent = Math.round((totalUploaded / file.size) * 100);
          onProgress(percent);
        }
      };
      xhr.send(blob);
    });

    // Remove quotes from ETag if present
    const cleanEtag = (etag || '').replace(/"/g, '');
    parts.push({ ETag: cleanEtag, PartNumber: partNumber });
    uploadedBytes += blob.size;
    onProgress(Math.round((uploadedBytes / file.size) * 100));
  }

  // Complete multipart
  const result = await completeMultipart({ key, uploadId, parts });
  return { key, result };
}

export async function deleteKey(key) {
  const token = localStorage.getItem('authToken');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/uploads/${encodeURIComponent(key)}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => null);
    throw new Error(txt || 'Failed to delete object');
  }
  return res.json();
}

export function parseKeyFromFileUrl(fileUrl) {
  if (!fileUrl) return null;
  try {
    // handle urls like /api/uploads/url?key=...
    const u = new URL(fileUrl, window.location.origin);
    return u.searchParams.get('key');
  } catch (e) {
    // not a full URL, try to parse manually
    const idx = fileUrl.indexOf('key=');
    if (idx !== -1) return decodeURIComponent(fileUrl.slice(idx + 4));
  }
  return null;
}

export async function deleteFromFileUrl(fileUrl) {
  const key = parseKeyFromFileUrl(fileUrl);
  if (!key) return null;
  return deleteKey(key);
}

export default { presign, initiateMultipart, presignPart, completeMultipart, abortMultipart, uploadLargeFile, deleteKey, parseKeyFromFileUrl, deleteFromFileUrl };
