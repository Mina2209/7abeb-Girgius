import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHymns } from '../../contexts/HymnContext';
import { useTags } from '../../contexts/TagContext';
import { useUpload, UPLOAD_STATUS } from '../../contexts/UploadContext';
import { useToast } from '../../contexts/ToastContext';
import { LyricService, HymnService } from '../../api';
import { API_BASE } from '../../config/apiConfig';
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import TagMultiSelect from '../../components/TagMultiSelect';
import FilePicker from '../../components/FilePicker';
import LyricEditor from '../../components/LyricEditor';
import { parseOptionalInt } from '../../utils/formatters';

const HymnForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createHymn, updateHymn, hymns } = useHymns();
  const { tags, createTag } = useTags();
  const { uploadFile } = useUpload();
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    tags: [],
    files: [{ type: '', fileUrl: '', size: '', duration: '', placeholder: true }],
    lyricContent: '',
    pendingTagNames: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing && hymns.length > 0) {
      const hymn = hymns.find(h => h.id === id);
      if (hymn) {
        setFormData({
          title: hymn.title || '',
          tags: hymn.tags ? hymn.tags.map(t => t.id) : [],
          files: (hymn.files || []).map(f => ({ ...f, placeholder: false })),
          lyricContent: hymn.lyric?.content || '',
          pendingTagNames: []
        });
      }
    }
  }, [id, hymns, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const removePendingTag = (tagNameToRemove) => {
    setFormData(prev => ({
      ...prev,
      pendingTagNames: prev.pendingTagNames.filter(name => name !== tagNameToRemove)
    }));
  };

  const addFile = () => {
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, { type: '', fileUrl: '', size: '', duration: '', placeholder: true, status: 'idle' }]
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const activateFileSlot = (index) => {
    setFormData(prev => {
      const files = prev.files.map((f, i) => i === index ? { ...(f || {}), placeholder: false } : f);
      const hasPlaceholder = files.some(f => f && f.placeholder);
      if (!hasPlaceholder) files.push({ type: '', fileUrl: '', size: '', duration: '', placeholder: true, status: 'idle' });
      return { ...prev, files };
    });
  };

  const updateFile = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.map((file, i) =>
        i === index
          ? (field === null ? { ...value } : { ...file, [field]: value })
          : file
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Process Tags
      const createdTagNames = [];
      if (formData.pendingTagNames.length > 0) {
        for (const tagName of formData.pendingTagNames) {
          try {
            await createTag({ name: tagName });
            createdTagNames.push(tagName);
          } catch (err) {
            console.error(`Failed to create tag "${tagName}":`, err);
          }
        }
      }

      const allTagNames = [
        ...formData.tags.map(id => tags.find(t => t.id === id)?.name).filter(Boolean),
        ...createdTagNames
      ];

      // 2. Prepare Hymn Data (for initial save)
      // We will save the hymn first, then handle uploads asynchronously
      const hymnData = {
        title: formData.title,
        tags: allTagNames,
        files: [] // Start with no files, we'll update later
      };

      let hymnId = id;
      if (isEditing) {
        await updateHymn(id, hymnData);
        toast.success('تم تحديث بيانات الترنيمة بنجاح');
      } else {
        const created = await createHymn(hymnData);
        hymnId = created.id;
        toast.success('تم إنشاء الترنيمة بنجاح. جاري بدء تحميل الملفات...');
      }

      // 3. Save Lyrics
      if (hymnId && formData.lyricContent) {
        await LyricService.upsert(hymnId, formData.lyricContent);
      }

      // 4. Handle Background Uploads
      const filesToUpload = formData.files.filter(f => f.fileObject && !f.placeholder);

      // If we have files to upload, we'll process them in the background
      // The context handles the uploads, but we need to update the hymn when they finish
      if (filesToUpload.length > 0) {
        filesToUpload.forEach(async (f) => {
          // Start the upload in the global context
          try {
            // We need to define onComplete to update the hymn record with the new file URL
            await uploadFile(f.fileObject, 'hymn', async (result) => {
              // This callback runs when upload completes
              // Now we need to fetch the LATEST hymn data and append this file
              // NOTE: This might be race-condition prone if multiple finish at once,
              // but for now we'll optimistically update.
              // A better backend API would be `POST /hymns/:id/files` to append a file.

              // Since we don't have that, we'll construct the file object locally
              const newFileEntry = {
                type: f.type || f.fileObject.type,
                fileUrl: result.fileUrl,
                originalName: result.filename, // Original filename with Unicode chars
                size: parseInt(result.size),
                duration: parseOptionalInt(f.duration)
              };

              // We need to trigger an update to the hymn
              try {
                // We can't access `hymns` state reliably here inside async callback potentially after component unmount
                // But we have `updateHymn` from context which should be stable.
                // Ideally the backend should handle "attach file to hymn" but let's try to update here.
                // To avoid overwriting other concurrent updates, we should ideally fetch fresh.
                // For now, let's just use the toast to notify.

                // However, the USER wants the hymn to be saved with the file.
                // Since we are decoupling, we MUST ensure the file gets linked.

                // STRATEGY: 
                // We will update the hymn with the new "fileList" which is current files + new file.
                // We can fetch the current hymn data via API first? Or just trust the backend.

                // Since we can't easily update the hymn from a detached callback (if user navigated),
                // we will rely on a separate mechanism: 
                // The upload finishes, provides a URL.
                // The USER might have left the page.

                // HACK/SOLUTION: We will update the hymn inside the `HymnForm` ONLY IF they wait.
                // BUT the user wants to leave.

                // CORRECT SOLUTION: The `UploadContext` should handle the "post-upload action".
                // But `UploadContext` is generic.

                // Let's modify `UploadContext` to accept a `metadata` object or `onSuccess` async callback
                // that persists even if this component unmounts. Checks out: `onComplete` in `uploadFile` is closure based.
                // As long as `updateHymn` is from context and safe to call, it will work.

                // But `updateHymn` likely depends on `client` which is stable.
                // The issue is `hymnId`. It's captured in the closure. Valid.

                // So:
                // 1. Fetch current hymn
                // 2. Append file
                // 3. Save

                // Actually `updateHymn` usually takes the full object.
                // We'll need a way to "patch" the hymn files.
                // If the backend doesn't support PATCH files, we risk overwriting tags/title if changed elsewhere.
                // Assuming single user for now, it's low risk.

                // Let's implement the simpler version:
                // "Optimistic update" logic inside the callback:
                const freshHymn = hymns.find(h => h.id === hymnId) || {};
                const existingFiles = freshHymn.files || [];

                // Avoid duplicates if callback runs twice
                if (!existingFiles.some(ef => ef.fileUrl === result.fileUrl)) {
                  await updateHymn(hymnId, {
                    ...freshHymn,
                    files: [...existingFiles, newFileEntry]
                  });
                  toast.success(`تم إضافة الملف ${result.filename} إلى الترنيمة`);
                }

              } catch (err) {
                console.error("Failed to attach file to hymn", err);
                toast.error(`فشل ربط الملف ${result.filename} بالترنيمة`);
              }
            });
          } catch (e) {
            console.error("Failed to start upload", e);
          }
        });
      }

      // Preserve existing files that weren't changed
      // Wait... we saved the hymn with empty files above for creation.
      // If editing, we should have kept existing files.
      // Fix step 2:
      /*
      const preservedFiles = formData.files.filter(f => !f.fileObject && f.fileUrl && !f.placeholder);
      const hymnData = {
         // ...
         files: preservedFiles // Keep existing remote files
      }
      */

      // Navigate immediately while uploads happen in background
      navigate('/hymns');

    } catch (error) {
      console.error(error);
      setError(error.message || 'حدث خطأ أثناء حفظ الترنيمة');
      toast.error('حدث خطأ أثناء الحفظ');
      setLoading(false); // Only stop loading if we didn't navigate
    }
  };

  // Helper to map MIME types to Backend Enums - MOVED OUTSIDE handleSave for stability
  const getFileTypeEnum = (mimeType) => {
    if (!mimeType) return 'POWERPOINT';
    const lower = mimeType.toLowerCase();

    // Check for valid enums first if passed directly
    if (['MUSIC_AUDIO', 'VIDEO_MONTAGE', 'VIDEO_POWERPOINT', 'POWERPOINT'].includes(mimeType)) {
      return mimeType;
    }

    if (lower.startsWith('audio/')) return 'MUSIC_AUDIO';
    if (lower.startsWith('video/')) return 'VIDEO_MONTAGE';
    // Fallback all else to POWERPOINT
    return 'POWERPOINT';
  };

  // Re-write handleSubmit to be clean and correct based on logic above
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create pending tags
      const createdTagNames = [];
      if (formData.pendingTagNames.length > 0) {
        for (const tagName of formData.pendingTagNames) {
          try {
            await createTag({ name: tagName });
            createdTagNames.push(tagName);
          } catch (err) { console.error(err); }
        }
      }

      const allTagNames = [
        ...formData.tags.map(id => tags.find(t => t.id === id)?.name).filter(Boolean),
        ...createdTagNames
      ];

      // 2. Separate existing files from new uploads and sanitize them
      const existingRemoteFiles = formData.files
        .filter(f => f.fileUrl && !f.fileObject && !f.placeholder)
        .map(f => {
          const finalType = getFileTypeEnum(f.type || '');
          console.log(`Sanitizing Existing File: ${f.type} -> ${finalType}`, f.fileUrl);
          return {
            type: finalType,
            fileUrl: f.fileUrl,
            originalName: f.originalName, // Preserve original filename
            size: parseInt(f.size || 0),
            duration: parseInt(f.duration || 0) || null
          };
        });

      const hymnData = {
        title: formData.title,
        tags: allTagNames,
        files: existingRemoteFiles
      };

      let targetHymnId = id;

      // 3. Save Hymn (Create or Update)
      if (isEditing) {
        await updateHymn(id, hymnData);
        toast.success('تم حفظ التغييرات الأساسية');
      } else {
        const created = await createHymn(hymnData);
        targetHymnId = created.id;
        toast.success('تم إنشاء الترنيمة. جاري رفع الملفات في الخلفية...');
      }

      if (targetHymnId && formData.lyricContent) {
        await LyricService.upsert(targetHymnId, formData.lyricContent);
      }

      // 4. Queue Up Uploads
      const validNewFiles = formData.files.filter(f => f.fileObject && !f.placeholder);

      if (validNewFiles.length > 0) {
        validNewFiles.forEach(f => {
          uploadFile(f.fileObject, 'hymn', async (result) => {
            try {
              // FETCH fresh data to append safely
              const { data: freshHymn } = await HymnService.getById(targetHymnId);

              if (freshHymn) {
                const currentFiles = freshHymn.files || [];
                const newFileEntry = {
                  type: getFileTypeEnum(f.type || f.fileObject.type), // Map new upload type
                  fileUrl: result.fileUrl,
                  originalName: result.filename, // Original filename with Unicode chars
                  size: parseInt(result.size),
                  duration: parseOptionalInt(f.duration)
                };

                // Prevent duplicates based on URL
                if (!currentFiles.some(cf => cf.fileUrl === newFileEntry.fileUrl)) {
                  // CRITICAL FIX: Strict sanitization
                  // 1. Sanitize Tags: Convert objects to names
                  const sanitizedTags = (freshHymn.tags || []).map(t =>
                    typeof t === 'object' && t.name ? t.name : t
                  );

                  // 2. Sanitize Files: Strip backend metadata AND ensure Enums
                  // We map ALL files through the safe enum converter
                  const sanitizedFiles = [...currentFiles, newFileEntry].map(f => {
                    const mappedType = getFileTypeEnum(f.type || '');
                    return {
                      type: mappedType,
                      fileUrl: f.fileUrl,
                      originalName: f.originalName, // Preserve original filename
                      size: f.size,
                      duration: parseInt(f.duration || 0) || null
                    };
                  });

                  await updateHymn(targetHymnId, {
                    title: freshHymn.title,
                    tags: sanitizedTags,
                    // lyricId removed: backend might not expect it or it might cause issues if invalid
                    files: sanitizedFiles
                  });
                  toast.success(`تم إضافة الملف ${result.filename} إلى الترنيمة`);
                }
              }
            } catch (e) {
              console.error("Failed to attach file to hymn after upload", e);
              toast.error(`فشل ربط الملف ${result.filename} بالترنيمة`);
            }
          });
        });
      }

      navigate('/hymns');

    } catch (err) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء الحفظ');
      toast.error('حدث خطأ أثناء الحفظ');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/hymns')}
          className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 ml-2" />
          العودة إلى الترانيم
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'تعديل الترنيمة' : 'إضافة ترنيمة جديدة'}
        </h1>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-6"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
          }
        }}
      >
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Title */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-slate-700">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            عنوان الترنيمة *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="أدخل عنوان الترنيمة"
          />
        </div>

        {/* Tags */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-slate-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            المواضيع
          </label>
          <TagMultiSelect
            allTags={tags}
            selectedIds={formData.tags}
            onChange={(next) => setFormData(prev => ({ ...prev, tags: next }))}
            placeholder="اختيار المواضيع"
            pendingTagNames={formData.pendingTagNames}
            onAddPendingTag={(tagName) => {
              setFormData(prev => ({
                ...prev,
                pendingTagNames: [...prev.pendingTagNames, tagName]
              }));
            }}
          />

          {/* Selected Tags */}
          {(formData.tags.length > 0 || formData.pendingTagNames.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.tags.map((tagId) => {
                const t = tags.find(x => x.id === tagId);
                return (
                  <span
                    key={tagId}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300"
                  >
                    {t?.name || tagId}
                    <button
                      type="button"
                      onClick={() => removeTag(tagId)}
                      className="mr-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                );
              })}
              {formData.pendingTagNames.map((tagName) => (
                <span
                  key={`pending-${tagName}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700"
                >
                  {tagName} (جديد)
                  <button
                    type="button"
                    onClick={() => removePendingTag(tagName)}
                    className="mr-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Files */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              الملفات
            </label>
            <button
              type="button"
              onClick={addFile}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-slate-700 hover:bg-blue-200 dark:hover:bg-slate-600 transition-colors"
            >
              <PlusIcon className="h-4 w-4 ml-1" />
              إضافة ملف
            </button>
          </div>

          {formData.files.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">لا توجد ملفات مضافة</p>
          ) : (
            <div className="space-y-3">
              {formData.files.map((file, index) => (
                <FilePicker
                  key={index}
                  index={index}
                  value={file}
                  placeholder={!!file.placeholder}
                  onActivate={activateFileSlot}
                  onChange={(updated) => updateFile(index, null, updated)}
                  onRemove={() => removeFile(index)}
                  uploadType="hymn"
                />
              ))}
            </div>
          )}
        </div>

        {/* Lyrics */}
        <LyricEditor
          content={formData.lyricContent}
          onChange={(content) => setFormData(prev => ({ ...prev, lyricContent: content }))}
        />

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/hymns')}
            className="px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl disabled:opacity-50 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
          >
            {loading ? 'جاري الحفظ...' : (isEditing ? 'تحديث' : 'حفظ')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HymnForm;