import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTags } from '../../contexts/TagContext';
import { ArrowLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { normalizeArabic } from '../../utils/normalizeArabic';
import { useClickOutside } from '../../hooks/useClickOutside';

const TagForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createTag, updateTag, tags } = useTags();
  
  const [formData, setFormData] = useState({
    name: '',
    category: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const categoryRef = useRef(null);

  const isEditing = Boolean(id);

  // Close category dropdown on outside click
  useClickOutside(categoryRef, () => setShowCategoryDropdown(false), showCategoryDropdown);

  // Extract unique categories from tags
  const existingCategories = useMemo(() => {
    const uniqueCategories = [...new Set(tags.filter(t => t.category).map(t => t.category))];
    return uniqueCategories.sort();
  }, [tags]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return existingCategories;
    const searchNormalized = normalizeArabic(categorySearch);
    return existingCategories.filter(cat => 
      normalizeArabic(cat).includes(searchNormalized)
    );
  }, [existingCategories, categorySearch]);

  useEffect(() => {
    if (isEditing && tags.length > 0) {
      const tag = tags.find(t => t.id === id);
      if (tag) {
        setFormData({
          name: tag.name || '',
          category: tag.category || ''
        });
        setCategorySearch(tag.category || '');
      }
    }
  }, [id, tags, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'category') {
      setCategorySearch(value);
      setShowCategoryDropdown(true);
    }
  };

  const handleCategorySelect = (category) => {
    setFormData(prev => ({
      ...prev,
      category: category
    }));
    setCategorySearch(category);
    setShowCategoryDropdown(false);
  };

  const handleCategoryInputFocus = () => {
    setShowCategoryDropdown(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        category: formData.category.trim() || ''
      };
      
      if (isEditing) {
        await updateTag(id, submitData);
      } else {
        await createTag(submitData);
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

        {/* Category */}
        <div className="relative" ref={categoryRef}>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            الفئة (اختياري)
          </label>
          <div className="relative">
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              onFocus={handleCategoryInputFocus}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="أدخل فئة الموضوع أو اختر من القائمة"
            />
            {existingCategories.length > 0 && (
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-auto"
              >
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              </button>
            )}
          </div>
          {showCategoryDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
              {filteredCategories.length > 0 ? (
                <>
                  {filteredCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategorySelect(category)}
                      className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {category}
                    </button>
                  ))}
                  {categorySearch.trim() && !existingCategories.includes(categorySearch.trim()) && (
                    <div className="border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleCategorySelect(categorySearch.trim())}
                        className="w-full text-right px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium"
                      >
                        إنشاء فئة جديدة: "{categorySearch.trim()}"
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {categorySearch.trim() ? (
                    <div className="border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleCategorySelect(categorySearch.trim())}
                        className="w-full text-right px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium"
                      >
                        إنشاء فئة جديدة: "{categorySearch.trim()}"
                      </button>
                    </div>
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      {existingCategories.length > 0 ? 'لا توجد فئات مطابقة' : 'ابدأ بكتابة اسم فئة جديدة'}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
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
