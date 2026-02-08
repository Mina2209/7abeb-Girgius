import { useState, useRef, useMemo } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { normalizeArabic } from '../utils/normalizeArabic';
import { useClickOutside } from '../hooks/useClickOutside';

export default function TagMultiSelect({ allTags, selectedIds, onChange, placeholder = 'اختيار المواضيع', pendingTagNames = [], onAddPendingTag }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);

  const filtered = allTags.filter(t => {
    const term = normalizeArabic(search);
    return term === '' || normalizeArabic(t.name).includes(term) || (t.category && normalizeArabic(t.category).includes(term));
  });

  const groupedTags = useMemo(() => {
    const groups = {};
    const uncategorized = [];

    filtered.forEach(tag => {
      if (tag.category) {
        if (!groups[tag.category]) {
          groups[tag.category] = [];
        }
        groups[tag.category].push(tag);
      } else {
        uncategorized.push(tag);
      }
    });

    return { groups, uncategorized };
  }, [filtered]);

  const hasNoMatches = search.trim() !== '' && filtered.length === 0;
  const searchNormalized = normalizeArabic(search);
  const exactMatch = allTags.some(t => normalizeArabic(t.name) === searchNormalized);
  const isPending = pendingTagNames.some(name => normalizeArabic(name) === searchNormalized);

  const toggle = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(x => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleAddPendingTag = () => {
    if (!onAddPendingTag || !search.trim() || exactMatch || isPending) return;
    onAddPendingTag(search.trim());
    setSearch('');
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex justify-between items-center px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      >
        <span>{selectedIds.length > 0 ? `تم اختيار ${selectedIds.length}` : placeholder}</span>
        <ChevronDownIcon className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl max-h-72 overflow-auto">
          <div className="p-2 sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن موضوع..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {Object.keys(groupedTags.groups).length > 0 && Object.keys(groupedTags.groups).sort().map(category => (
            <div key={category}>
              <div className="px-4 py-2 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{category}</span>
              </div>
              {groupedTags.groups[category].map(tag => (
                <label key={tag.id} className="flex items-center px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 pr-8 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(tag.id)}
                    onChange={() => toggle(tag.id)}
                    className="ml-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">{tag.name}</span>
                </label>
              ))}
            </div>
          ))}

          {groupedTags.uncategorized.length > 0 && (
            <>
              {Object.keys(groupedTags.groups).length > 0 && (
                <div className="px-4 py-2 bg-gray-50 dark:bg-slate-700/50 border-b border-t border-gray-100 dark:border-slate-700">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">بدون فئة</span>
                </div>
              )}
              {groupedTags.uncategorized.map(tag => (
                <label key={tag.id} className="flex items-center px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(tag.id)}
                    onChange={() => toggle(tag.id)}
                    className="ml-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">{tag.name}</span>
                </label>
              ))}
            </>
          )}

          {hasNoMatches && !exactMatch && !isPending && onAddPendingTag && (
            <button
              type="button"
              onClick={handleAddPendingTag}
              className="w-full text-right px-4 py-3 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              {`إضافة "${search.trim()}" كموضوع جديد`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
