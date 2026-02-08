import { DocumentTextIcon } from '@heroicons/react/24/outline';

/**
 * LyricEditor component for editing hymn lyrics
 * 
 * @param {Object} props
 * @param {string} props.content - The lyric content
 * @param {Function} props.onChange - Callback when content changes
 */
const LyricEditor = ({ content = '', onChange }) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <DocumentTextIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        كلمات الترنيمة
      </label>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="أدخل كلمات الترنيمة هنا..."
        className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y text-right bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        dir="rtl"
      />
      <p className="text-xs text-gray-400 dark:text-gray-500">
        يمكنك إدخال كلمات الترنيمة بجميع اللغات هنا
      </p>
    </div>
  );
};

export default LyricEditor;

