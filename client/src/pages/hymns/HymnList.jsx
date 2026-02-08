import { useState, useRef, useMemo } from "react";
import { useHymns } from "../../contexts/HymnContext";
import { useTags } from "../../contexts/TagContext";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MusicalNoteIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { normalizeArabic } from "../../utils/normalizeArabic";
import { useClickOutside } from "../../hooks/useClickOutside";
import TagMultiSelect from "../../components/TagMultiSelect";
import { FILE_TYPES, TYPE_PRIORITY } from "../../constants/fileTypes";
import { formatDuration, formatSize } from "../../utils/formatters";
import HymnCard from "../../components/HymnCard";
import ConfirmDialog from "../../components/ConfirmDialog";

const HymnList = () => {
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

  useClickOutside(sortRef, () => setShowSortDropdown(false), showSortDropdown);
  useClickOutside(tagsRef, () => setShowTagsDropdown(false), showTagsDropdown);
  useClickOutside(fileTypesRef, () => setShowFileTypesDropdown(false), showFileTypesDropdown);

  const sortOptions = [
    { value: "most-recent", label: "الأحدث" },
    { value: "alphabetical", label: "أبجدياً" },
    { value: "duration-desc", label: "المدة (تنازلي)" },
    { value: "duration-asc", label: "المدة (تصاعدي)" },
  ];

  const typePriority = TYPE_PRIORITY;

  const confirmDelete = (id) => setShowDeleteConfirm(id);

  const handleDelete = async (id) => {
    try {
      await deleteHymn(id);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting hymn:", err);
    }
  };

  const filteredHymns = useMemo(() => {
    const normTerm = normalizeArabic(searchTerm);
    return hymns
      .filter((hymn) => {
        const matchesSearch =
          normTerm === "" ||
          normalizeArabic(hymn.title).includes(normTerm) ||
          hymn.tags.some((tag) => normalizeArabic(tag.name).includes(normTerm)) ||
          (hymn.lyric?.content && normalizeArabic(hymn.lyric.content).includes(normTerm));
        const matchesTags =
          selectedTags.length === 0 ||
          selectedTags.every((tagId) => hymn.tags.some((tag) => tag.id === tagId));
        const matchesFileTypes =
          selectedFileTypes.length === 0 ||
          selectedFileTypes.every((fileType) => hymn.files.some((file) => file.type === fileType));
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

  const handleFileTypeToggle = (fileType) => {
    setSelectedFileTypes((prev) =>
      prev.includes(fileType) ? prev.filter((type) => type !== fileType) : [...prev, fileType]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSortBy("most-recent");
    setSelectedTags([]);
    setSelectedFileTypes([]);
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
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl text-white shadow-lg">
            <MusicalNoteIcon className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">الترانيم</h1>
        </div>
        <Link
          to="/hymns/add"
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <PlusIcon className="h-5 w-5" />
          إضافة ترنيمة جديدة
        </Link>
      </div>

      {/* Filter Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-slate-700">
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
              className="block w-full pr-10 pl-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="w-full flex justify-between items-center px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <span>{sortOptions.find((opt) => opt.value === sortBy)?.label}</span>
              <ChevronDownIcon className={`h-5 w-5 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showSortDropdown && (
              <div className="absolute z-10 mt-2 w-full bg-white dark:bg-slate-800 shadow-xl rounded-xl py-2 border border-gray-100 dark:border-slate-700 overflow-hidden">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => { setSortBy(option.value); setShowSortDropdown(false); }}
                    className="w-full text-right px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tags Dropdown */}
          <div className="relative" ref={tagsRef}>
            <TagMultiSelect allTags={tags} selectedIds={selectedTags} onChange={setSelectedTags} placeholder="المواضيع" />
          </div>

          {/* File Types Dropdown */}
          <div className="relative" ref={fileTypesRef}>
            <button
              onClick={() => setShowFileTypesDropdown(!showFileTypesDropdown)}
              className="w-full flex justify-between items-center px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <span>الملفات المتاحة</span>
              <ChevronDownIcon className={`h-5 w-5 transition-transform ${showFileTypesDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showFileTypesDropdown && (
              <div className="absolute z-10 mt-2 w-full bg-white dark:bg-slate-800 shadow-xl rounded-xl py-2 border border-gray-100 dark:border-slate-700 overflow-hidden">
                {FILE_TYPES.map((fileType) => (
                  <label key={fileType.value} className="flex items-center px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedFileTypes.includes(fileType.value)}
                      onChange={() => handleFileTypeToggle(fileType.value)}
                      className="ml-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">{fileType.label}</span>
                  </label>
                ))}
              </div>
            )}
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
        عرض {filteredHymns.length} من أصل {hymns.length} ترنيمة
      </div>

      {/* Hymns Grid */}
      {filteredHymns.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400 text-lg bg-white dark:bg-slate-800 rounded-xl shadow-md">
          لا توجد نتائج للبحث
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredHymns.map((hymn) => (
            <HymnCard key={hymn.id} hymn={hymn} onDelete={confirmDelete} />
          ))}
        </div>
      )}

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

export default HymnList;
