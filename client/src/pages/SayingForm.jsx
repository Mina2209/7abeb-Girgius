import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSayings } from '../contexts/SayingContext';
import { useTags } from '../contexts/TagContext';
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import TagMultiSelect from '../components/TagMultiSelect';

const SayingForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createSaying, updateSaying, sayings } = useSayings();
  const { tags, createTag } = useTags();

  const [formData, setFormData] = useState({
    author: '',
    authorImage: '',
    source: '',
    content: '',
    tags: [],
    pendingTagNames: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing && sayings.length > 0) {
      const saying = sayings.find(s => s.id === id);
      if (saying) {
        setFormData({
          author: saying.author || '',
          authorImage: saying.authorImage || '',
          source: saying.source || '',
          content: saying.content || '',
          tags: saying.tags ? saying.tags.map(t => t.id) : [],
          pendingTagNames: []
        });
      }
    }
  }, [id, sayings, isEditing]);

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

      const sayingData = {
        author: formData.author,
        authorImage: formData.authorImage || null,
        source: formData.source || null,
        content: formData.content,
        tags: allTagNames
      };

      if (isEditing) {
        await updateSaying(id, sayingData);
      } else {
        await createSaying(sayingData);
      }

      navigate('/fathers-quotes');
    } catch (error) {
      setError(error.message || 'حدث خطأ أثناء حفظ القول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/fathers-quotes')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 ml-2" />
          العودة إلى أقوال الآباء
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'تعديل القول' : 'إضافة قول جديد'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Author */}
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
            اسم القائل *
          </label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="أدخل اسم القائل"
            dir="rtl"
          />
        </div>

        {/* Author Image */}
        <div>
          <label htmlFor="authorImage" className="block text-sm font-medium text-gray-700 mb-2">
            صورة القائل (رابط)
          </label>
          <input
            type="url"
            id="authorImage"
            name="authorImage"
            value={formData.authorImage}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/author-image.jpg"
          />
        </div>

        {/* Source */}
        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
            المصدر
          </label>
          <input
            type="text"
            id="source"
            name="source"
            value={formData.source}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="مثال: العظة على الجبل، سيرته، عظات على إنجيل متى"
            dir="rtl"
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            نص القول *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            required
            rows={4}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="أدخل نص القول هنا..."
            dir="rtl"
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

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 space-x-reverse">
          <button
            type="button"
            onClick={() => navigate('/fathers-quotes')}
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

export default SayingForm;
