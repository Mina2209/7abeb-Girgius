import { useState } from 'react';
import { PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const LANGUAGE_OPTIONS = [
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'English' },
  { value: 'coptic', label: 'قبطي' },
];

/**
 * LyricEditor component for managing multiple lyric entries for a hymn
 * 
 * @param {Object} props
 * @param {Array} props.lyrics - Array of lyric objects { language, content, verseOrder }
 * @param {Function} props.onChange - Callback when lyrics change
 */
const LyricEditor = ({ lyrics = [], onChange }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const addLyric = () => {
    const newLyric = {
      language: 'ar',
      content: '',
      verseOrder: lyrics.length,
      isNew: true
    };
    onChange([...lyrics, newLyric]);
    setExpandedIndex(lyrics.length);
  };

  const updateLyric = (index, field, value) => {
    const updated = lyrics.map((lyric, i) => 
      i === index ? { ...lyric, [field]: value } : lyric
    );
    onChange(updated);
  };

  const removeLyric = (index) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الكلمات؟')) return;
    const updated = lyrics.filter((_, i) => i !== index);
    // Update verseOrder for remaining lyrics
    const reordered = updated.map((lyric, i) => ({ ...lyric, verseOrder: i }));
    onChange(reordered);
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const moveLyric = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= lyrics.length) return;
    
    const updated = [...lyrics];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    // Update verseOrder
    const reordered = updated.map((lyric, i) => ({ ...lyric, verseOrder: i }));
    onChange(reordered);
    setExpandedIndex(newIndex);
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const getLanguageLabel = (langCode) => {
    return LANGUAGE_OPTIONS.find(opt => opt.value === langCode)?.label || langCode;
  };

  const getPreviewText = (content, maxLength = 50) => {
    if (!content) return 'لا يوجد محتوى';
    const trimmed = content.trim();
    if (trimmed.length <= maxLength) return trimmed;
    return trimmed.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          كلمات الترنيمة
        </label>
        <button
          type="button"
          onClick={addLyric}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
        >
          <PlusIcon className="h-4 w-4 ml-1" />
          إضافة كلمات
        </button>
      </div>

      {lyrics.length === 0 ? (
        <p className="text-sm text-gray-500">لا توجد كلمات مضافة</p>
      ) : (
        <div className="space-y-3">
          {lyrics.map((lyric, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Header - always visible */}
              <div
                className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleExpand(index)}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getLanguageLabel(lyric.language)}
                  </span>
                  <span className="text-sm text-gray-600 truncate max-w-xs">
                    {getPreviewText(lyric.content)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Move buttons */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveLyric(index, -1); }}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="تحريك لأعلى"
                  >
                    <ChevronUpIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveLyric(index, 1); }}
                    disabled={index === lyrics.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="تحريك لأسفل"
                  >
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeLyric(index); }}
                    className="p-1 text-red-400 hover:text-red-600"
                    title="حذف"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Expanded content */}
              {expandedIndex === index && (
                <div className="p-4 space-y-4 border-t border-gray-200">
                  {/* Language selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اللغة
                    </label>
                    <select
                      value={lyric.language}
                      onChange={(e) => updateLyric(index, 'language', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {LANGUAGE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Content textarea */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الكلمات
                    </label>
                    <textarea
                      value={lyric.content}
                      onChange={(e) => updateLyric(index, 'content', e.target.value)}
                      rows={8}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-arabic"
                      placeholder="اكتب كلمات الترنيمة هنا..."
                      dir={lyric.language === 'en' ? 'ltr' : 'rtl'}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {lyric.content?.length || 0} حرف
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LyricEditor;
