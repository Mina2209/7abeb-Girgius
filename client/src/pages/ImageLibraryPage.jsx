import { useState, useMemo, useCallback, useEffect } from "react";
import { useImages } from "../contexts/ImageContext";
import { useTags } from "../contexts/TagContext";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { normalizeArabic } from "../utils/normalizeArabic";
import TagMultiSelect from "../components/TagMultiSelect";
import ConfirmDialog from "../components/ConfirmDialog";
import { API_BASE } from "../config/apiConfig";

const ImageLibraryPage = () => {
  const {
    images,
    total,
    page,
    limit,
    authors,
    types,
    loading,
    error,
    fetchImages,
    deleteImage,
    loadAuthors,
    loadTypes,
  } = useImages();
  const { tags } = useTags();

  // Re-fetch data whenever this page is navigated to
  useEffect(() => {
    fetchImages({ page: 1, limit: 20 });
    loadAuthors();
    loadTypes();
  }, []);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [aiFilter, setAiFilter] = useState("all"); // 'all' | 'ai' | 'not-ai'

  // UI states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const totalPages = Math.ceil(total / limit);

  const handlePageChange = (newPage) => {
    fetchImages({ page: newPage, limit, search: searchTerm || undefined });
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    // Debounced search: fetch page 1 with search
    fetchImages({ page: 1, limit, search: value || undefined });
  };

  const confirmDelete = (id) => setShowDeleteConfirm(id);

  const handleDelete = async (id) => {
    try {
      await deleteImage(id);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting image:", err);
    }
  };

  // Client-side filtering for author, type, tags, AI (on top of server-paginated data)
  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      const matchesAuthor =
        !selectedAuthor || img.authorId === selectedAuthor;
      const matchesType =
        !selectedType || img.typeId === selectedType;
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tagId) =>
          img.tags.some((tag) => tag.id === tagId)
        );
      const matchesAi =
        aiFilter === "all" ||
        (aiFilter === "ai" && img.ai) ||
        (aiFilter === "not-ai" && !img.ai);
      return matchesAuthor && matchesType && matchesTags && matchesAi;
    });
  }, [images, selectedAuthor, selectedType, selectedTags, aiFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setSelectedAuthor("");
    setSelectedType("");
    setAiFilter("all");
    fetchImages({ page: 1, limit });
  };

  const buildImageSrc = (imageUrl) => {
    if (!imageUrl) return null;
    // If it's a /api/uploads/url?key=... path, prefix with API_BASE
    if (imageUrl.startsWith('/api/')) {
      return `${API_BASE.replace('/api', '')}${imageUrl}`;
    }
    return imageUrl;
  };

  if (loading && images.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
            <PhotoIcon className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            مكتبة الصور
          </h1>
        </div>
        <Link
          to="/images/add"
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <PlusIcon className="h-5 w-5" />
          إضافة صورة جديدة
        </Link>
      </div>

      {/* Filter Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="بحث بالعنوان..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full pr-10 pl-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Tags Dropdown */}
          <div>
            <TagMultiSelect
              allTags={tags}
              selectedIds={selectedTags}
              onChange={setSelectedTags}
              placeholder="المواضيع"
            />
          </div>

          {/* Author Dropdown */}
          <div>
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              <option value="">كل المؤلفين</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Dropdown */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              <option value="">كل الأنواع</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* AI Filter */}
          <div>
            <select
              value={aiFilter}
              onChange={(e) => setAiFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              <option value="all">الكل (AI)</option>
              <option value="ai">مُنشأ بالذكاء الاصطناعي</option>
              <option value="not-ai">غير مُنشأ بالذكاء الاصطناعي</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            مسح جميع الفلاتر
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        عرض {filteredImages.length} من أصل {total} صورة
      </div>

      {/* Image Grid */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400 text-lg bg-white dark:bg-slate-800 rounded-xl shadow-md">
          لا توجد صور
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 group"
            >
              {/* Image Thumbnail */}
              <div className="relative aspect-square bg-gray-100 dark:bg-slate-700 overflow-hidden">
                {image.imageUrl ? (
                  <img
                    src={buildImageSrc(image.imageUrl)}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PhotoIcon className="h-16 w-16 text-gray-300 dark:text-slate-600" />
                  </div>
                )}

                {/* AI Badge */}
                {image.ai && (
                  <div className="absolute top-2 left-2 bg-purple-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <SparklesIcon className="h-3 w-3" />
                    AI
                  </div>
                )}

                {/* Published Badge */}
                {!image.published && (
                  <div className="absolute top-2 right-2 bg-yellow-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                    مسودة
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
                    {image.title}
                  </h3>
                  <div className="flex gap-1 mr-2 flex-shrink-0">
                    <Link
                      to={`/images/edit/${image.id}`}
                      className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => confirmDelete(image.id)}
                      className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Author & Type */}
                <div className="flex flex-wrap gap-1.5 mb-2 text-xs">
                  {image.author && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                      {image.author.name}
                    </span>
                  )}
                  {image.type && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                      {image.type.name}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {image.tags && image.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {image.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300"
                      >
                        {tag.name}
                      </span>
                    ))}
                    {image.tags.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{image.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 py-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronRightIcon className="h-4 w-4" />
            السابق
          </button>

          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            صفحة {page} من {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            التالي
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!showDeleteConfirm}
        title="تأكيد الحذف"
        message="هل أنت متأكد من أنك تريد حذف هذه الصورة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={() => handleDelete(showDeleteConfirm)}
        onCancel={() => setShowDeleteConfirm(null)}
      />
    </div>
  );
};

export default ImageLibraryPage;
