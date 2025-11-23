import { useState, useRef, useMemo } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { normalizeArabic } from '../utils/normalizeArabic';
import { useClickOutside } from '../hooks/useClickOutside';

// A reusable tag multi-select dropdown with search.
// Props:
// - allTags: array of { id, name }
// - selectedIds: array of tag ids
// - onChange: function(nextIds)
// - placeholder: string button label
// - pendingTagNames: array of tag names that will be created on submit
// - onAddPendingTag: function(tagName) - callback to add a tag name to pending list
export default function TagMultiSelect({ allTags, selectedIds, onChange, placeholder = 'اختيار المواضيع', pendingTagNames = [], onAddPendingTag }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);

  const filtered = allTags.filter(t => {
    const term = normalizeArabic(search);
    return term === '' || normalizeArabic(t.name).includes(term) || (t.category && normalizeArabic(t.category).includes(term));
  });

  // Group filtered tags by category
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
        className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        <span>{selectedIds.length > 0 ? `تم اختيار ${selectedIds.length}` : placeholder}</span>
        <ChevronDownIcon className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-72 overflow-auto">
          <div className="p-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن موضوع..."
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Grouped by category */}
          {Object.keys(groupedTags.groups).length > 0 && Object.keys(groupedTags.groups).sort().map(category => (
            <div key={category}>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <span className="text-xs font-semibold text-gray-600">{category}</span>
              </div>
              {groupedTags.groups[category].map(tag => (
                <label key={tag.id} className="flex items-center px-4 py-2 hover:bg-gray-100 pr-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(tag.id)}
                    onChange={() => toggle(tag.id)}
                    className="ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{tag.name}</span>
                </label>
              ))}
            </div>
          ))}
          
          {/* Uncategorized tags */}
          {groupedTags.uncategorized.length > 0 && (
            <>
              {Object.keys(groupedTags.groups).length > 0 && (
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 border-t border-gray-200">
                  <span className="text-xs font-semibold text-gray-600">بدون فئة</span>
                </div>
              )}
              {groupedTags.uncategorized.map(tag => (
                <label key={tag.id} className="flex items-center px-4 py-2 hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(tag.id)}
                    onChange={() => toggle(tag.id)}
                    className="ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{tag.name}</span>
                </label>
              ))}
            </>
          )}
          
          {hasNoMatches && !exactMatch && !isPending && onAddPendingTag && (
            <button
              type="button"
              onClick={handleAddPendingTag}
              className="w-full text-right px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
            >
              {`إضافة "${search.trim()}" كموضوع جديد`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
