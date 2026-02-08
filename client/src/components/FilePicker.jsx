import { useRef, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FILE_TYPES } from '../constants/fileTypes';

// maps MIME types to our FILE_TYPES values
const mimeToType = (mime) => {
  if (!mime) return null;
  if (mime.startsWith('video/')) return 'VIDEO_MONTAGE';
  if (mime.startsWith('audio/')) return 'MUSIC_AUDIO';
  if (mime === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || mime === 'application/vnd.ms-powerpoint') return 'POWERPOINT';
  return null;
};

const FilePicker = ({ value = {}, onChange = () => { }, onRemove = () => { }, index, placeholder = false, onActivate = () => { }, uploadType = null }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(value.fileUrl || '');
  const [autoType, setAutoType] = useState(value.type || '');
  const [autoFilled, setAutoFilled] = useState({ type: false, size: false, duration: false });
  const [filename, setFilename] = useState(value.fileName || '');


  const openFileDialog = () => {
    // If this is a placeholder slot, notify parent to activate it (remove fade and provide a new placeholder)
    if (placeholder) onActivate(index);
    inputRef.current?.click();
  };

  const formatBytes = (bytes) => {
    const n = Number(bytes) || 0;
    if (n === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(n) / Math.log(1024));
    const value = n / Math.pow(1024, i);
    return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)} ${units[i]}`;
  };

  const formatDuration = (secs) => {
    const s = Number(secs);
    if (!Number.isFinite(s) || isNaN(s)) return '';
    const sec = Math.floor(s % 60);
    const min = Math.floor((s / 60) % 60);
    const hrs = Math.floor(s / 3600);
    const pad = (n) => String(n).padStart(2, '0');
    if (hrs > 0) return `${hrs}:${pad(min)}:${pad(sec)}`;
    return `${pad(min)}:${pad(sec)}`;
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

    // Do NOT upload here. Keep the file object and preview local and
    // let the parent form perform the upload when the user clicks Save.
    // Attach the actual File object so parent can upload later.
    updated.fileObject = file;

    onChange(updated);
  };

  const onFileInputChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) handleFileChosen(f);
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    if (!newType) return; // prevent clearing type by selecting the placeholder
    setAutoType(newType);
    // user manually changed type; mark as not auto-filled for type
    setAutoFilled(prev => ({ ...prev, type: false }));
    onChange({ ...value, type: newType });
  };

  return (
    <div className={`relative flex flex-col sm:flex-row items-start gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-md transition-all duration-200 ${placeholder ? 'opacity-40 hover:opacity-95 cursor-pointer bg-gray-50 dark:bg-slate-800/50 shadow-sm' : 'bg-white dark:bg-slate-800 hover:shadow'} `}>
      {/* Trash / remove icon at top-right */}
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute -top-2 -right-2 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-full p-1 shadow hover:bg-red-50 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 z-10"
        aria-label="Remove file slot"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
      <input ref={inputRef} type="file" className="hidden" onChange={onFileInputChange} />

      {/* Preview column */}
      <div className="w-full sm:w-80 flex-shrink-0">
        <button type="button" onClick={openFileDialog} className="w-full px-3 py-2 bg-blue-100 dark:bg-slate-700 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-slate-600 transition-colors">اختر ملف</button>
        {previewUrl && (
          <div className="mt-2">
            {autoType && autoType.startsWith('VIDEO') ? (
              <video src={previewUrl} className="w-full sm:w-80 h-24 object-contain" controls />
            ) : autoType === 'MUSIC_AUDIO' ? (
              <div className="flex items-center gap-2">
                <audio src={previewUrl} controls className="w-full" />
              </div>
            ) : (
              <a href={previewUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">فتح الملف</a>
            )}
          </div>
        )}
        {filename && <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 truncate">{filename}</div>}

      </div>

      {/* Details column */}
      <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 min-w-[180px]">
          {/* Type selector - always editable */}
          <select value={value.type || autoType || ''} onChange={handleTypeChange} className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
            <option value="" disabled>اختر نوع</option>
            {FILE_TYPES.map(ft => (
              <option key={ft.value} value={ft.value} className="dark:bg-slate-700">{ft.label}</option>
            ))}
          </select>
        </div>

        {/* File details: shown only when a file exists */}
        {(value.fileUrl || filename) && (
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <div className="text-xs text-gray-500 dark:text-gray-400 mr-1">معلومات الملف</div>
            <div className="w-full sm:w-36 text-sm text-gray-700 dark:text-gray-300">
              <div>{value.size ? formatBytes(value.size) : '-'}</div>
            </div>

            {(value.type && (value.type.startsWith('VIDEO') || value.type === 'MUSIC_AUDIO')) || !!value.duration ? (
              <div className="w-full sm:w-36 text-sm text-gray-700 dark:text-gray-300">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">المدة</div>
                <div>{value.duration ? formatDuration(value.duration) : '-'}</div>
              </div>
            ) : null}
          </div>
        )}

        <div>
          {/* empty space kept for layout consistency */}
        </div>
      </div>
    </div>
  );
};

export default FilePicker;
