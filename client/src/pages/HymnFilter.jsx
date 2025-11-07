import { useState, useRef, useMemo } from "react";
import { useHymns } from "../contexts/HymnContext";
import { useTags } from "../contexts/TagContext";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { normalizeArabic } from "../utils/normalizeArabic";
import { useClickOutside } from "../hooks/useClickOutside";
import TagMultiSelect from "../components/TagMultiSelect";
import { FILE_TYPES, TYPE_PRIORITY } from "../constants/fileTypes";
import { formatDuration, formatSize } from "../utils/formatters";
import ConfirmDialog from "../components/ConfirmDialog";

const HymnFilter = () => {
  const { hymns, loading, error, deleteHymn } = useHymns();
  const { tags } = useTags();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("most-recent");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedFileTypes, setSelectedFileTypes] = useState([]);

  // UI states
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [showFileTypesDropdown, setShowFileTypesDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Refs for click-outside handling
  const sortRef = useRef(null);
  const tagsRef = useRef(null);
  const fileTypesRef = useRef(null);

  // Close sort dropdown on outside click
  useClickOutside(sortRef, () => setShowSortDropdown(false), showSortDropdown);

  // Close tags dropdown on outside click
  useClickOutside(tagsRef, () => setShowTagsDropdown(false), showTagsDropdown);

  // Close file types dropdown on outside click
  useClickOutside(
    fileTypesRef,
    () => setShowFileTypesDropdown(false),
    showFileTypesDropdown
  );

  // Sort options
  const sortOptions = [
    { value: "most-recent", label: "الأحدث" },
    { value: "alphabetical", label: "أبجدياً" },
    { value: "duration-desc", label: "المدة (تنازلي)" },
    { value: "duration-asc", label: "المدة (تصاعدي)" },
  ];

  const typePriority = TYPE_PRIORITY;

  const confirmDelete = (id) => {
    setShowDeleteConfirm(id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteHymn(id);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting hymn:", err);
    }
  };

  // Optimized filtering and sorting with useMemo
  const filteredHymns = useMemo(() => {
    const normTerm = normalizeArabic(searchTerm);

    return hymns
      .filter((hymn) => {
        // Search filter
        const matchesSearch =
          normTerm === "" ||
          normalizeArabic(hymn.title).includes(normTerm) ||
          hymn.tags.some((tag) => normalizeArabic(tag.name).includes(normTerm));

        // Tags filter
        const matchesTags =
          selectedTags.length === 0 ||
          selectedTags.every((tagId) =>
            hymn.tags.some((tag) => tag.id === tagId)
          );

        // File types filter
        const matchesFileTypes =
          selectedFileTypes.length === 0 ||
          selectedFileTypes.every((fileType) =>
            hymn.files.some((file) => file.type === fileType)
          );

        return matchesSearch && matchesTags && matchesFileTypes;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "most-recent":
            return new Date(b.createdAt) - new Date(a.createdAt);
          case "alphabetical":
            return a.title.localeCompare(b.title, "ar");
          case "duration-desc": {
            const aDuration = Math.max(...a.files.map((f) => f.duration || 0));
            const bDuration = Math.max(...b.files.map((f) => f.duration || 0));
            return bDuration - aDuration;
          }
          case "duration-asc": {
            const aDuration = Math.max(...a.files.map((f) => f.duration || 0));
            const bDuration = Math.max(...b.files.map((f) => f.duration || 0));
            return aDuration - bDuration;
          }
          default:
            return 0;
        }
      });
  }, [hymns, searchTerm, selectedTags, selectedFileTypes, sortBy]);

  // Handle file type selection
  const handleFileTypeToggle = (fileType) => {
    setSelectedFileTypes((prev) =>
      prev.includes(fileType)
        ? prev.filter((type) => type !== fileType)
        : [...prev, fileType]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSortBy("most-recent");
    setSelectedTags([]);
    setSelectedFileTypes([]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        خطأ: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">الترانيم</h1>
        <Link
          to="/hymns/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse transition-colors"
        >
          <PlusIcon className="h-5 w-5 ml-2" />
          إضافة ترنيمة جديدة
        </Link>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="اسم الترنيمة"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <span>
                {sortOptions.find((opt) => opt.value === sortBy)?.label}
              </span>
              <ChevronDownIcon className="h-5 w-5" />
            </button>
            {showSortDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSortDropdown(false);
                    }}
                    className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tags Dropdown (reused) */}
          <div className="relative" ref={tagsRef}>
            <TagMultiSelect
              allTags={tags}
              selectedIds={selectedTags}
              onChange={setSelectedTags}
              placeholder="المواضيع"
            />
          </div>

          {/* File Types Dropdown */}
          <div className="relative" ref={fileTypesRef}>
            <button
              onClick={() => setShowFileTypesDropdown(!showFileTypesDropdown)}
              className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <span>الملفات المتاحة</span>
              <ChevronDownIcon className="h-5 w-5" />
            </button>
            {showFileTypesDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                {FILE_TYPES.map((fileType) => (
                  <label
                    key={fileType.value}
                    className="flex items-center px-4 py-2 hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFileTypes.includes(fileType.value)}
                      onChange={() => handleFileTypeToggle(fileType.value)}
                      className="ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      {fileType.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
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
        عرض {filteredHymns.length} من {hymns.length} ترنيمة
      </div>

      {/* Hymns Grid */}
      {filteredHymns.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            لا توجد نتائج تطابق الفلاتر المحددة
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHymns.map((hymn) => (
            <div
              key={hymn.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col h-full"
            >
              {/* Content wrapper that grows */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {hymn.title}
                  </h3>
                  <div className="flex space-x-2 space-x-reverse">
                    <Link
                      to={`/hymns/edit/${hymn.id}`}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => confirmDelete(hymn.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {hymn.tags && hymn.tags.length > 0 && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-700">
                      المواضيع:
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {hymn.tags.map((tag) => (
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

                {hymn.files && hymn.files.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      الملفات:
                    </span>
                    <div className="mt-1 space-y-1">
                      {hymn.files
                        .filter((file) => file.type !== "تم الانشاء")
                        .slice()
                        .sort((a, b) => {
                          const pa = typePriority[a.type] ?? 999;
                          const pb = typePriority[b.type] ?? 999;
                          if (pa !== pb) return pa - pb;
                          return (a.type || "").localeCompare(b.type || "");
                        })
                        .map((file) => (
                          <div key={file.id} className="text-sm">
                            <div className="flex items-center gap-2">
                              <a
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                {file.type}
                              </a>
                              <div className="inline-flex items-center gap-2 text-gray-600">
                                {formatSize(file.size) && (
                                  <span
                                    dir="ltr"
                                    className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
                                  >
                                    {formatSize(file.size)}
                                  </span>
                                )}
                                {file.type !== "DOCUMENT" &&
                                  file.type !== "POWERPOINT" &&
                                  formatDuration(file.duration) && (
                                    <span
                                      dir="ltr"
                                      className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
                                    >
                                      {formatDuration(file.duration)}
                                    </span>
                                  )}
                                {file.type === "DOCUMENT" &&
                                  !formatSize(file.size) && (
                                    <span className="text-gray-500">
                                      حجم غير محدد
                                    </span>
                                  )}
                                {file.type === "POWERPOINT" &&
                                  !formatSize(file.size) && (
                                    <span className="text-gray-500">
                                      حجم غير محدد
                                    </span>
                                  )}
                                {file.type !== "DOCUMENT" &&
                                  file.type !== "POWERPOINT" &&
                                  !formatSize(file.size) &&
                                  !formatDuration(file.duration) && (
                                    <span className="text-gray-500">
                                      حجم/مدة غير محددين
                                    </span>
                                  )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dates - fixed at bottom */}
              <div className="mt-4 text-sm text-gray-500">
                <div>تم الإنشاء في: {new Date(hymn.createdAt).toLocaleDateString("ar-EG")}</div>
                {hymn.updatedAt && hymn.updatedAt !== hymn.createdAt && (
                  <div>آخر تحديث في: {new Date(hymn.updatedAt).toLocaleDateString("ar-EG")}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!showDeleteConfirm}
        title="تأكيد الحذف"
        message="هل أنت متأكد من أنك تريد حذف هذه الترنيمة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={() => handleDelete(showDeleteConfirm)}
        onCancel={() => setShowDeleteConfirm(null)}
      />
    </div>
  );
};

export default HymnFilter;
