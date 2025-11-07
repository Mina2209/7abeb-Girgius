import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTags } from '../contexts/TagContext';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const TagForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createTag, updateTag, tags } = useTags();
  
  const [formData, setFormData] = useState({
    name: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing && tags.length > 0) {
      const tag = tags.find(t => t.id === id);
      if (tag) {
        setFormData({
          name: tag.name || ''
        });
      }
    }
  }, [id, tags, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditing) {
        await updateTag(id, formData);
      } else {
        await createTag(formData);
      }
      
      navigate('/tags');
    } catch (error) {
      setError(error.message || 'حدث خطأ أثناء حفظ الموضوع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/tags')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 ml-2" />
          العودة إلى المواضيع
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'تعديل الموضوع' : 'إضافة موضوع جديد'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            اسم الموضوع *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="أدخل اسم الموضوع"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 space-x-reverse">
          <button
            type="button"
            onClick={() => navigate('/tags')}
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

export default TagForm; 