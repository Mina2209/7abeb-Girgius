import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHymns } from '../contexts/HymnContext';
import { useTags } from '../contexts/TagContext';
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { normalizeArabic } from '../utils/normalizeArabic';
import TagMultiSelect from '../components/TagMultiSelect';
import { FILE_TYPES } from '../constants/fileTypes';
import { parseOptionalInt } from '../utils/formatters';

const HymnForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createHymn, updateHymn, hymns } = useHymns();
  const { tags, createTag } = useTags();

  const [formData, setFormData] = useState({
    title: '',
    tags: [],
    files: [],
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
          files: hymn.files || [],
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
      files: [...prev.files, { type: '', fileUrl: '', size: '', duration: '' }]
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const updateFile = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.map((file, i) =>
        i === index ? { ...file, [field]: value } : file
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create pending tags first
      const createdTagNames = [];
      if (formData.pendingTagNames.length > 0) {
        for (const tagName of formData.pendingTagNames) {
          try {
            await createTag({ name: tagName });
            createdTagNames.push(tagName);
          } catch (err) {
            console.error(`Failed to create tag "${tagName}":`, err);
            // Continue with other tags even if one fails
          }
        }
      }

      // Combine existing tags (by ID) and newly created tags (by name)
      // The API accepts tag names, so we can use names directly
      const allTagNames = [
        // Existing tags by ID
        ...formData.tags
          .map(id => tags.find(t => t.id === id)?.name)
          .filter(Boolean),
        // Newly created tags by name (only include successfully created ones)
        ...createdTagNames
      ];

      const hymnData = {
        title: formData.title,
        tags: allTagNames,
        files: formData.files
          .filter(f => f.type && f.fileUrl)
          .map(f => ({
            type: f.type,
            fileUrl: f.fileUrl,
            size: parseOptionalInt(f.size),
            duration: parseOptionalInt(f.duration)
          }))
      };

      if (isEditing) {
        await updateHymn(id, hymnData);
      } else {
        await createHymn(hymnData);
      }

      navigate('/hymns');
    } catch (error) {
      setError(error.message || 'حدث خطأ أثناء حفظ الترنيمة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/hymns')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 ml-2" />
          العودة إلى الترانيم
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'تعديل الترنيمة' : 'إضافة ترنيمة جديدة'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            عنوان الترنيمة *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="أدخل عنوان الترنيمة"
          />
        </div>



        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {t?.name || tagId}
                    <button
                      type="button"
                      onClick={() => removeTag(tagId)}
                      className="mr-2 text-blue-600 hover:text-blue-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                );
              })}
              {formData.pendingTagNames.map((tagName) => (
                <span
                  key={`pending-${tagName}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-300"
                >
                  {tagName} (جديد)
                  <button
                    type="button"
                    onClick={() => removePendingTag(tagName)}
                    className="mr-2 text-yellow-600 hover:text-yellow-800"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Files */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              الملفات
            </label>
            <button
              type="button"
              onClick={addFile}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              <PlusIcon className="h-4 w-4 ml-1" />
              إضافة ملف
            </button>
          </div>

          {formData.files.length === 0 ? (
            <p className="text-sm text-gray-500">لا توجد ملفات مضافة</p>
          ) : (
            <div className="space-y-3">
              {formData.files.map((file, index) => (
                <div key={index} className="flex space-x-3 space-x-reverse p-3 border border-gray-300 rounded-md">
                  <select
                    value={file.type}
                    onChange={(e) => updateFile(index, 'type', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">اختر نوع الملف</option>
                    {FILE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label.toUpperCase()}</option>
                    ))}
                  </select>

                  <input
                    type="url"
                    value={file.fileUrl}
                    onChange={(e) => updateFile(index, 'fileUrl', e.target.value)}
                    placeholder="رابط الملف"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />

                  <input
                    type="number"
                    value={file.size}
                    onChange={(e) => updateFile(index, 'size', e.target.value)}
                    placeholder="الحجم (بايت)"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />

                  <input
                    type="number"
                    value={file.duration}
                    onChange={(e) => updateFile(index, 'duration', e.target.value)}
                    placeholder="المدة (ثواني)"
                    className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 space-x-reverse">
          <button
            type="button"
            onClick={() => navigate('/hymns')}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'جاري الحفظ...' : (isEditing ? 'تحديث' : 'حفظ')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HymnForm; 
