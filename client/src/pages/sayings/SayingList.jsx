import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSayings } from '../../contexts/SayingContext';
import { useTags } from '../../contexts/TagContext';
import TagMultiSelect from '../../components/TagMultiSelect';
import ConfirmDialog from '../../components/ConfirmDialog';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
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
          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl text-white shadow-lg">
            <ChatBubbleLeftRightIcon className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">أقوال الآباء</h1>
        </div>
        <Link
          to="/sayings/new"
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <PlusIcon className="h-5 w-5" />
          إضافة قول جديد
        </Link>
      </div>

      {/* Filter Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-slate-700">
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
              className="block w-full pr-10 pl-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              dir="rtl"
            />
          </div>

          {/* Tag Filter */}
          <div>
            <TagMultiSelect allTags={tags} selectedIds={selectedTagIds} onChange={setSelectedTagIds} placeholder="المواضيع" />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={clearFilters} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
            مسح جميع الفلاتر
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        عرض {filteredSayings.length} من أصل {sayings.length} قول
      </div>

      {/* Sayings Grid */}
      {filteredSayings.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400 text-lg bg-white dark:bg-slate-800 rounded-xl shadow-md">
          لا توجد نتائج للبحث
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSayings.map((saying) => (
            <div key={saying.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-200 flex flex-col h-full border border-gray-100 dark:border-slate-700 hover:-translate-y-1">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  {/* Actions and Author Info */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start flex-1">
                      {saying.authorImage && (
                        <img
                          src="saint-john.jpg"
                          alt={saying.author}
                          className="w-16 h-16 rounded-full object-cover flex-shrink-0 ml-3 ring-2 ring-amber-200 dark:ring-amber-700"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {saying.author}
                        </h3>
                        {saying.source && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            من: {saying.source}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Link to={`/sayings/${saying.id}/edit`} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button onClick={() => openDeleteDialog(saying)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <blockquote className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed bg-amber-50/50 dark:bg-amber-900/20 p-4 rounded-xl border-r-4 border-amber-400 dark:border-amber-600">
                    "{saying.content}"
                  </blockquote>

                  {/* Tags */}
                  {saying.tags && saying.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {saying.tags.map((tag) => (
                          <span key={tag.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <div>تم الإنشاء في: {new Date(saying.createdAt).toLocaleDateString('ar-EG')}</div>
                  {saying.updatedAt && saying.updatedAt !== saying.createdAt && (
                    <div>آخر تحديث في: {new Date(saying.updatedAt).toLocaleDateString('ar-EG')}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
