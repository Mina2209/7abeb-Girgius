import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTags } from '../contexts/TagContext';
import { TrashIcon, PencilIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ConfirmDialog from '../components/ConfirmDialog';
import { normalizeArabic } from '../utils/normalizeArabic';

const TagList = () => {
  const { tags, searchTerm, setSearchTerm, loading, error, deleteTag } = useTags();
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Compute filtered tags on the fly
  const filteredTags = tags.filter(tag =>
    normalizeArabic(tag.name).includes(normalizeArabic(localSearch))
  );

  const handleSearch = (e) => {
    const term = e.target.value;
    setLocalSearch(term);
    setSearchTerm(term);
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

  if (loading) return <div className="flex justify-center items-center h-64 text-xl text-gray-600">جاري التحميل...</div>;
  if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">خطأ: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">المواضيع</h1>
        <Link to="/tags/add" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse transition-colors">
          <PlusIcon className="h-5 w-5" /> <span>إضافة موضوع جديد</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="البحث في المواضيع..."
          value={localSearch}
          onChange={handleSearch}
          className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Tags Grid */}
      {filteredTags.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-lg">
          {localSearch ? 'لا توجد نتائج للبحث' : 'لا توجد مواضيع'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTags.map(tag => (
            <div key={tag.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col h-full">
              {/* Content wrapper that grows */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{tag.name}</h3>
                  <div className="flex space-x-2 space-x-reverse">
                    <Link to={`/tags/edit/${tag.id}`} className="text-blue-600 hover:text-blue-800 p-1">
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button onClick={() => confirmDelete(tag.id)} className="text-red-600 hover:text-red-800 p-1">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {(tag.hymns?.length > 0 || tag.sayings?.length > 0) && (
                  <div className="mb-4 grid grid-cols-3 gap-3">
                    {tag.hymns?.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">الترانيم المرتبطة:</span>
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {tag.hymns.length} ترنيمة
                          </span>
                        </div>
                      </div>
                    )}
                    {tag.sayings?.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">الأقوال المرتبطة:</span>
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {tag.sayings.length} قول
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dates - fixed at bottom */}
              <div className="text-sm text-gray-500 mt-4">
                <div>تم الإنشاء في: {new Date(tag.createdAt).toLocaleDateString('ar-EG')}</div>
                {tag.updatedAt && tag.updatedAt !== tag.createdAt && (
                  <div> آخر تحديث في: {new Date(tag.updatedAt).toLocaleDateString('ar-EG')}</div>
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
