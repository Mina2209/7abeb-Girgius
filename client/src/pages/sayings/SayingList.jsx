import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSayings } from '../../contexts/SayingContext';
import { useTags } from '../../contexts/TagContext';
import TagMultiSelect from '../../components/TagMultiSelect';
import ConfirmDialog from '../../components/ConfirmDialog';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Link } from "react-router-dom";

const SayingList = () => {
  const navigate = useNavigate();
  const { sayings, loading, error, deleteSaying } = useSayings();
  const { tags } = useTags();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [sayingToDelete, setSayingToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async (sayingId) => {
    try {
      await deleteSaying(sayingId);
      setShowDeleteDialog(false);
      setSayingToDelete(null);
    } catch (error) {
      console.error('Error deleting saying:', error);
    }
  };

  const openDeleteDialog = (saying) => {
    setSayingToDelete(saying);
    setShowDeleteDialog(true);
  };

  const filteredSayings = sayings.filter(saying => {
    const matchesSearch = !searchTerm ||
      saying.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      saying.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (saying.source && saying.source.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTags = selectedTagIds.length === 0 ||
      saying.tags.some(tag => selectedTagIds.includes(tag.id));

    return matchesSearch && matchesTags;
  });

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTagIds([]);
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
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        حدث خطأ: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          أقوال الآباء
        </h1>
        <Link
          to="/sayings/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse transition-colors"
        >
          <PlusIcon className="h-5 w-5 ml-2" />
          إضافة قول جديد
        </Link>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="القائل أو القول أو المصدر"
              className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              dir="rtl"
            />
          </div>

          {/* Tag Filter */}
          <div>
            <TagMultiSelect
              allTags={tags}
              selectedIds={selectedTagIds}
              onChange={setSelectedTagIds}
              placeholder="المواضيع"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
          >
            مسح جميع الفلاتر
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        عرض {filteredSayings.length} من أصل {sayings.length} قول
      </div>

      {/* Sayings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSayings.map((saying) => (
          <div key={saying.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
            <div className="flex flex-col h-full">
              {/* Content wrapper that grows */}
              <div className="flex-1">
                {/* Actions and Author Info */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start flex-1">
                    {saying.authorImage && (
                      <img
                        src="saint-john.jpg"
                        alt={saying.author}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0 ml-2"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {saying.author}
                      </h3>
                      {saying.source && (
                        <p className="text-sm text-gray-600 mb-2">
                          من: {saying.source}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <Link
                      to={`/sayings/${saying.id}/edit`}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => openDeleteDialog(saying)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <blockquote className="text-gray-700 mb-4 leading-relaxed">
                  "{saying.content}"
                </blockquote>

                {/* Tags */}
                {saying.tags && saying.tags.length > 0 && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-700">
                      المواضيع:
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {saying.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dates - fixed at bottom */}
              <div className="text-sm text-gray-500 mt-4">
                <div>تم الإنشاء في: {new Date(saying.createdAt).toLocaleDateString('ar-EG')}</div>
                {saying.updatedAt && saying.updatedAt !== saying.createdAt && (
                  <div>آخر تحديث في: {new Date(saying.updatedAt).toLocaleDateString('ar-EG')}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSayings.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-lg">
          لا توجد نتائج للبحث
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="تأكيد الحذف"
        message="هل أنت متأكد من أنك تريد حذف هذا القول؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={() => handleDelete(sayingToDelete?.id)}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
};

export default SayingList;
