import { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTags } from '../../contexts/TagContext';
import { TrashIcon, PencilIcon, PlusIcon, MagnifyingGlassIcon, ChevronDownIcon, TagIcon } from '@heroicons/react/24/outline';
import ConfirmDialog from '../../components/ConfirmDialog';
import { normalizeArabic } from '../../utils/normalizeArabic';
import { useClickOutside } from '../../hooks/useClickOutside';

const ENTITY_TYPES = [
  { value: 'hymns', label: 'الترانيم' },
  { value: 'sayings', label: 'الأقوال' },
];

const TagList = () => {
  const { tags, searchTerm, setSearchTerm, loading, error, deleteTag } = useTags();
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedEntityTypes, setSelectedEntityTypes] = useState([]);
  const [showEntityTypesDropdown, setShowEntityTypesDropdown] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const entityTypesRef = useRef(null);
  const categoriesRef = useRef(null);

  useClickOutside(entityTypesRef, () => setShowEntityTypesDropdown(false), showEntityTypesDropdown);
  useClickOutside(categoriesRef, () => setShowCategoriesDropdown(false), showCategoriesDropdown);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(tags.filter(t => t.category).map(t => t.category))];
    return uniqueCategories.sort();
  }, [tags]);

  const filteredTags = useMemo(() => {
    return tags.filter(tag => {
      const matchesSearch = normalizeArabic(tag.name).includes(normalizeArabic(localSearch));
      const matchesEntityTypes = selectedEntityTypes.length === 0 ||
        selectedEntityTypes.some(entityType => {
          switch (entityType) {
            case 'hymns': return tag.hymns && tag.hymns.length > 0;
            case 'sayings': return tag.sayings && tag.sayings.length > 0;
            default: return false;
          }
        });
      const matchesCategory = selectedCategories.length === 0 ||
        (tag.category && selectedCategories.includes(tag.category));
      return matchesSearch && matchesEntityTypes && matchesCategory;
    });
  }, [tags, localSearch, selectedEntityTypes, selectedCategories]);

  const handleSearch = (e) => {
    const term = e.target.value;
    setLocalSearch(term);
    setSearchTerm(term);
  };

  const handleEntityTypeToggle = (entityType) => {
    setSelectedEntityTypes(prev =>
      prev.includes(entityType) ? prev.filter(type => type !== entityType) : [...prev, entityType]
    );
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(cat => cat !== category) : [...prev, category]
    );
  };

  const clearFilters = () => {
    setLocalSearch('');
    setSearchTerm('');
    setSelectedEntityTypes([]);
    setSelectedCategories([]);
  };

  const confirmDelete = (id) => setShowDeleteConfirm(id);

  const handleDelete = async (id) => {
    try {
      await deleteTag(id);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting tag:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
        حدث خطأ: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl text-white shadow-lg">
            <TagIcon className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">المواضيع</h1>
        </div>
        <Link
          to="/tags/add"
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <PlusIcon className="h-5 w-5" />
          إضافة موضوع جديد
        </Link>
      </div>

      {/* Filter Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="البحث في المواضيع..."
              value={localSearch}
              onChange={handleSearch}
              className="block w-full pr-10 pl-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Entity Types Dropdown */}
          <div className="relative" ref={entityTypesRef}>
            <button
              onClick={() => setShowEntityTypesDropdown(!showEntityTypesDropdown)}
              className="w-full flex justify-between items-center px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              <span>المرتبطة بـ</span>
              <ChevronDownIcon className={`h-5 w-5 transition-transform ${showEntityTypesDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showEntityTypesDropdown && (
              <div className="absolute z-10 mt-2 w-full bg-white dark:bg-slate-800 shadow-xl rounded-xl py-2 border border-gray-100 dark:border-slate-700 overflow-hidden">
                {ENTITY_TYPES.map((entityType) => (
                  <label key={entityType.value} className="flex items-center px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedEntityTypes.includes(entityType.value)}
                      onChange={() => handleEntityTypeToggle(entityType.value)}
                      className="ml-3 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-slate-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">{entityType.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Categories Dropdown */}
          {categories.length > 0 && (
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
                className="w-full flex justify-between items-center px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                <span>الفئة {selectedCategories.length > 0 && `(${selectedCategories.length})`}</span>
                <ChevronDownIcon className={`h-5 w-5 transition-transform ${showCategoriesDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showCategoriesDropdown && (
                <div className="absolute z-10 mt-2 w-full bg-white dark:bg-slate-800 shadow-xl rounded-xl py-2 border border-gray-100 dark:border-slate-700 overflow-hidden">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="ml-3 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-slate-600 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200">{category}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={clearFilters} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
            مسح جميع الفلاتر
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        عرض {filteredTags.length} من أصل {tags.length} موضوع
      </div>

      {/* Tags Grid */}
      {filteredTags.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400 text-lg bg-white dark:bg-slate-800 rounded-xl shadow-md">
          لا توجد نتائج للبحث
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTags.map(tag => (
            <div key={tag.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-200 flex flex-col h-full border border-gray-100 dark:border-slate-700 hover:-translate-y-1">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{tag.name}</h3>
                    {tag.category && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 mt-2">
                        {tag.category}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Link to={`/tags/edit/${tag.id}`} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button onClick={() => confirmDelete(tag.id)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {(tag.hymns?.length > 0 || tag.sayings?.length > 0) && (
                  <div className="mb-4 flex flex-wrap gap-3">
                    {tag.hymns?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                          {tag.hymns.length} ترنيمة
                        </span>
                      </div>
                    )}
                    {tag.sayings?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                          {tag.sayings.length} قول
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                <div>تم الإنشاء في: {new Date(tag.createdAt).toLocaleDateString('ar-EG')}</div>
                {tag.updatedAt && tag.updatedAt !== tag.createdAt && (
                  <div>آخر تحديث في: {new Date(tag.updatedAt).toLocaleDateString('ar-EG')}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!showDeleteConfirm}
        title="تأكيد الحذف"
        message="هل أنت متأكد من أنك تريد حذف هذا الموضوع؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={() => handleDelete(showDeleteConfirm)}
        onCancel={() => setShowDeleteConfirm(null)}
      />
    </div>
  );
};

export default TagList;
