import { useRef, useState } from 'react';
import uploadService from '../api/uploadService';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FILE_TYPES } from '../constants/fileTypes';

// maps MIME types to our FILE_TYPES values
const mimeToType = (mime) => {
  if (!mime) return null;
  if (mime.startsWith('video/')) return 'VIDEO_MONTAGE';
  if (mime.startsWith('audio/')) return 'MUSIC_AUDIO';
  if (mime === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || mime === 'application/vnd.ms-powerpoint') return 'POWERPOINT';
  if (mime === 'application/msword' || mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'WORD_DOCUMENT';
  return null;
};

const FilePicker = ({ value = {}, onChange = () => {}, onRemove = () => {}, index }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(value.fileUrl || '');
  const [autoType, setAutoType] = useState(value.type || '');
  const [autoFilled, setAutoFilled] = useState({ type: false, size: false, duration: false });
  const [filename, setFilename] = useState(value.fileName || '');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleFileChosen = async (file) => {
    if (!file) return;

    // create object URL for preview while upload runs
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFilename(file.name || '');

    // base values
    const updated = {
      ...value,
      fileUrl: url,
      size: file.size || '',
    };

    // detect type from mime
    const detected = mimeToType(file.type) || '';
    updated.type = detected;
    setAutoType(detected);
    // mark auto-filled fields so we can lock editing where appropriate (duration unknown yet)
    setAutoFilled({ type: !!detected, size: true, duration: false });

    // if video/audio, extract duration reliably
    if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
      await new Promise((resolve) => {
        const media = document.createElement(file.type.startsWith('video/') ? 'video' : 'audio');
        media.preload = 'metadata';
        media.src = url;
        const onLoaded = () => {
          const d = Number(media.duration);
          if (Number.isFinite(d) && !isNaN(d)) {
            updated.duration = Math.floor(d);
            setAutoFilled(prev => ({ ...prev, duration: true }));
          } else {
            updated.duration = '';
            setAutoFilled(prev => ({ ...prev, duration: false }));
          }
          cleanup();
          resolve();
        };
        const onError = () => {
          updated.duration = '';
          setAutoFilled(prev => ({ ...prev, duration: false }));
          cleanup();
          resolve();
        };
        const cleanup = () => {
          media.onloadedmetadata = null;
          media.onerror = null;
        };
        media.onloadedmetadata = onLoaded;
        media.onerror = onError;
        // fallback
        setTimeout(() => {
          if (!updated.duration) {
            updated.duration = '';
            setAutoFilled(prev => ({ ...prev, duration: false }));
            resolve();
          }
        }, 2500);
      });
      // revoke the object URL after a short delay so preview can still use it
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }

    // upload to S3 via presigned PUT (server provides URL) or multipart for large files
    setUploading(true);
    setProgress(0);
    try {
      const MULTIPART_THRESHOLD = 50 * 1024 * 1024; // 50MB - switch to multipart above this
      if (file.size > MULTIPART_THRESHOLD && uploadService.uploadLargeFile) {
        // use multipart upload with progress callback
        const { key } = await uploadService.uploadLargeFile(file, (percent) => {
          setProgress(percent);
        });
        updated.fileUrl = `/api/uploads/url?key=${encodeURIComponent(key)}`;
        updated.size = file.size || updated.size;
        updated.fileName = file.name;
      } else {
        // single PUT
        const presignJson = await uploadService.presign(file.name, file.type);
        const { url, key } = presignJson;

        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', url);
          // set content type so S3 stores correct metadata
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              // use server endpoint to generate a presigned GET when needed
              updated.fileUrl = `/api/uploads/url?key=${encodeURIComponent(key)}`;
              updated.size = file.size || updated.size;
              updated.fileName = file.name;
              resolve();
            } else {
              console.error('Upload failed', xhr.statusText || xhr.responseText);
              reject(new Error('Upload failed'));
            }
          };
          xhr.onerror = () => reject(new Error('Upload error'));
          xhr.send(file);
        });
      }
    } catch (err) {
      console.error('Upload error', err);
    } finally {
      setUploading(false);
      setProgress(0);
    }

    onChange(updated);
  };

  const onFileInputChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) handleFileChosen(f);
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setAutoType(newType);
    // user manually changed type; mark as not auto-filled for type
    setAutoFilled(prev => ({ ...prev, type: false }));
    onChange({ ...value, type: newType });
  };

  return (
    <div className="flex items-start gap-3 p-3 border border-gray-300 rounded-md">
      <input ref={inputRef} type="file" className="hidden" onChange={onFileInputChange} />

      {/* Preview column */}
      <div className="w-40 flex-shrink-0">
        <button type="button" onClick={openFileDialog} className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-md">اختر ملف</button>
        {previewUrl && (
          <div className="mt-2">
            {autoType && autoType.startsWith('VIDEO') ? (
              <video src={previewUrl} className="w-40 h-24 object-contain" controls />
            ) : autoType === 'MUSIC_AUDIO' ? (
              <div className="flex items-center gap-2">
                <audio src={previewUrl} controls className="w-full" />
              </div>
            ) : (
              <a href={previewUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">فتح الملف</a>
            )}
          </div>
        )}
        {filename && <div className="text-xs text-gray-600 mt-2 truncate">{filename}</div>}
        {uploading && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
              <div className="h-2 bg-blue-600" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-xs text-gray-500 mt-1">Uploading {progress}%</div>
          </div>
        )}
      </div>

      {/* Details column */}
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1">
          {/* Type selector / display */}
          {autoType && autoType.startsWith('VIDEO') ? (
            <select value={value.type || autoType || ''} onChange={handleTypeChange} className="px-3 py-2 border rounded-md w-full">
              <option value="">اختر نوع</option>
              {FILE_TYPES.filter(ft => ft.value.startsWith('VIDEO')).map(ft => (
                <option key={ft.value} value={ft.value}>{ft.label}</option>
              ))}
            </select>
          ) : (
            <select value={value.type || autoType || ''} disabled className="px-3 py-2 border rounded-md bg-gray-100 w-full">
              <option value="">{value.type || autoType || 'غير محدد'}</option>
            </select>
          )}
        </div>

        <div className="w-28">
          <input
            type="number"
            value={value.size || ''}
            onChange={(e) => onChange({ ...value, size: e.target.value })}
            placeholder="الحجم"
            className="w-full px-2 py-1 border rounded-md text-sm"
            readOnly={!!autoFilled.size || uploading}
          />
        </div>

        <div className="w-28">
          <input
            type="number"
            value={value.duration || ''}
            onChange={(e) => onChange({ ...value, duration: e.target.value })}
            placeholder="المدة"
            className="w-full px-2 py-1 border rounded-md text-sm"
            readOnly={!!autoFilled.duration || uploading}
          />
        </div>

        <div>
          <button type="button" onClick={() => onRemove(index)} className="text-red-600 p-1">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePicker;
