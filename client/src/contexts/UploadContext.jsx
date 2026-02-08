import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { presign, initiateMultipart, presignPart, completeMultipart, abortMultipart } from '../api/uploadService';
import { API_BASE } from '../config/apiConfig';

const UploadContext = createContext(null);

const UPLOAD_STATUS = {
    PENDING: 'pending',
    UPLOADING: 'uploading',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    ERROR: 'error',
    CANCELLED: 'cancelled'
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

export const useUpload = () => {
    const context = useContext(UploadContext);
    if (!context) {
        throw new Error('useUpload must be used within an UploadProvider');
    }
    return context;
};

export const UploadProvider = ({ children }) => {
    const [uploads, setUploads] = useState([]);
    const [isMinimized, setIsMinimized] = useState(false);
    const abortControllersRef = useRef({});
    const uploadIdCounter = useRef(0);

    // Warn user before leaving page with active uploads
    useEffect(() => {
        const hasActiveUploads = uploads.some(u =>
            u.status === UPLOAD_STATUS.UPLOADING || u.status === UPLOAD_STATUS.PENDING
        );

        const handleBeforeUnload = (e) => {
            if (hasActiveUploads) {
                e.preventDefault();
                e.returnValue = 'لديك عمليات تحميل جارية. هل أنت متأكد من المغادرة؟';
                return e.returnValue;
            }
        };

        if (hasActiveUploads) {
            window.addEventListener('beforeunload', handleBeforeUnload);
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [uploads]);

    // Update upload state helper
    const updateUpload = useCallback((id, updates) => {
        setUploads(prev => prev.map(u =>
            u.id === id ? { ...u, ...updates } : u
        ));
    }, []);

    // Upload a single file with progress and retry support
    const uploadFile = useCallback(async (file, folder = 'hymn', onComplete) => {
        const id = ++uploadIdCounter.current;
        const abortController = new AbortController();
        abortControllersRef.current[id] = abortController;

        const uploadItem = {
            id,
            filename: file.name,
            size: file.size,
            progress: 0,
            status: UPLOAD_STATUS.PENDING,
            error: null,
            result: null,
            retryCount: 0
        };

        setUploads(prev => [...prev, uploadItem]);

        const doUpload = async (retryCount = 0) => {
            try {
                updateUpload(id, { status: UPLOAD_STATUS.UPLOADING, retryCount });

                const MULTIPART_THRESHOLD = 50 * 1024 * 1024; // 50MB
                let resultKey;

                if (file.size > MULTIPART_THRESHOLD) {
                    // Multipart upload for large files
                    resultKey = await uploadLargeFileWithProgress(
                        id, file, folder, abortController.signal, updateUpload
                    );
                } else {
                    // Simple upload for smaller files
                    resultKey = await uploadSimpleFileWithProgress(
                        id, file, folder, abortController.signal, updateUpload
                    );
                }

                const fileUrl = `${API_BASE}/uploads/url?key=${encodeURIComponent(resultKey)}`;

                updateUpload(id, {
                    status: UPLOAD_STATUS.COMPLETED,
                    progress: 100,
                    result: { key: resultKey, fileUrl }
                });

                if (onComplete) {
                    onComplete({ key: resultKey, fileUrl, filename: file.name, size: file.size });
                }

                return { key: resultKey, fileUrl };

            } catch (error) {
                if (error.name === 'AbortError') {
                    updateUpload(id, { status: UPLOAD_STATUS.CANCELLED, error: 'تم إلغاء التحميل' });
                    return null;
                }

                // Connection error - retry
                if (retryCount < MAX_RETRIES && isNetworkError(error)) {
                    updateUpload(id, {
                        status: UPLOAD_STATUS.PAUSED,
                        error: `خطأ في الاتصال. إعادة المحاولة ${retryCount + 1}/${MAX_RETRIES}...`
                    });

                    await sleep(RETRY_DELAY_MS * (retryCount + 1));
                    return doUpload(retryCount + 1);
                }

                updateUpload(id, {
                    status: UPLOAD_STATUS.ERROR,
                    error: error.message || 'فشل التحميل'
                });
                throw error;
            }
        };

        try {
            return await doUpload();
        } catch (error) {
            console.error('Upload failed:', error);
            return null;
        }
    }, [updateUpload]);

    // Cancel an upload
    const cancelUpload = useCallback((id) => {
        const controller = abortControllersRef.current[id];
        if (controller) {
            controller.abort();
            delete abortControllersRef.current[id];
        }
        updateUpload(id, { status: UPLOAD_STATUS.CANCELLED });
    }, [updateUpload]);

    // Remove an upload from the list
    const removeUpload = useCallback((id) => {
        cancelUpload(id);
        setUploads(prev => prev.filter(u => u.id !== id));
    }, [cancelUpload]);

    // Retry a failed upload
    const retryUpload = useCallback(async (id) => {
        const upload = uploads.find(u => u.id === id);
        if (!upload || !upload.file) return;

        removeUpload(id);
        return uploadFile(upload.file, upload.folder, upload.onComplete);
    }, [uploads, removeUpload, uploadFile]);

    // Clear completed/cancelled/error uploads
    const clearCompleted = useCallback(() => {
        const activeIds = uploads
            .filter(u => u.status === UPLOAD_STATUS.UPLOADING || u.status === UPLOAD_STATUS.PENDING)
            .map(u => u.id);

        setUploads(prev => prev.filter(u => activeIds.includes(u.id)));
    }, [uploads]);

    const activeCount = uploads.filter(u =>
        u.status === UPLOAD_STATUS.UPLOADING || u.status === UPLOAD_STATUS.PENDING
    ).length;

    const hasErrors = uploads.some(u => u.status === UPLOAD_STATUS.ERROR);

    const value = {
        uploads,
        uploadFile,
        cancelUpload,
        removeUpload,
        retryUpload,
        clearCompleted,
        isMinimized,
        setIsMinimized,
        activeCount,
        hasErrors,
        UPLOAD_STATUS
    };

    return (
        <UploadContext.Provider value={value}>
            {children}
        </UploadContext.Provider>
    );
};

// Helper functions

function isNetworkError(error) {
    return (
        error.message === 'Failed to fetch' ||
        error.message === 'Network request failed' ||
        error.message.includes('network') ||
        error.name === 'TypeError'
    );
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function uploadSimpleFileWithProgress(id, file, folder, signal, updateUpload) {
    const { url, key } = await presign(file.name, file.type, folder);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        const handleAbort = () => {
            xhr.abort();
            reject(new DOMException('Aborted', 'AbortError'));
        };

        signal.addEventListener('abort', handleAbort);

        xhr.open('PUT', url);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const progress = Math.round((e.loaded / e.total) * 100);
                updateUpload(id, { progress });
            }
        };

        xhr.onload = () => {
            signal.removeEventListener('abort', handleAbort);
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(key);
            } else {
                reject(new Error('Upload failed'));
            }
        };

        xhr.onerror = () => {
            signal.removeEventListener('abort', handleAbort);
            reject(new Error('Network error'));
        };

        xhr.send(file);
    });
}

async function uploadLargeFileWithProgress(id, file, folder, signal, updateUpload) {
    const PART_SIZE = 10 * 1024 * 1024; // 10MB per part
    const { key, uploadId } = await initiateMultipart(file.name, file.type, folder);

    const partsCount = Math.ceil(file.size / PART_SIZE);
    const parts = [];
    let uploadedBytes = 0;

    try {
        for (let partNumber = 1; partNumber <= partsCount; partNumber++) {
            if (signal.aborted) {
                throw new DOMException('Aborted', 'AbortError');
            }

            const start = (partNumber - 1) * PART_SIZE;
            const end = Math.min(start + PART_SIZE, file.size);
            const blob = file.slice(start, end);
            const { url } = await presignPart({ key, uploadId, partNumber });

            const etag = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                const handleAbort = () => {
                    xhr.abort();
                    reject(new DOMException('Aborted', 'AbortError'));
                };

                signal.addEventListener('abort', handleAbort);

                xhr.open('PUT', url);
                xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const totalProgress = Math.round(((uploadedBytes + e.loaded) / file.size) * 100);
                        updateUpload(id, { progress: totalProgress });
                    }
                };

                xhr.onload = () => {
                    signal.removeEventListener('abort', handleAbort);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const et = xhr.getResponseHeader('ETag') || xhr.getResponseHeader('etag');
                        resolve(et || '');
                    } else {
                        reject(new Error('Part upload failed'));
                    }
                };

                xhr.onerror = () => {
                    signal.removeEventListener('abort', handleAbort);
                    reject(new Error('Network error'));
                };

                xhr.send(blob);
            });

            const cleanEtag = (etag || '').replace(/"/g, '');
            parts.push({ ETag: cleanEtag, PartNumber: partNumber });
            uploadedBytes += blob.size;
        }

        await completeMultipart({ key, uploadId, parts });
        return key;

    } catch (error) {
        // Abort the multipart upload on error
        if (error.name !== 'AbortError') {
            try {
                await abortMultipart({ key, uploadId });
            } catch (e) {
                console.error('Failed to abort multipart upload:', e);
            }
        }
        throw error;
    }
}

export { UPLOAD_STATUS };
