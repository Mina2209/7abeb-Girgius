import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    PencilIcon,
    TrashIcon,
    MusicalNoteIcon,
    DocumentTextIcon,
    MicrophoneIcon,
    VideoCameraIcon,
    ClockIcon,
    DocumentDuplicateIcon,
    PlayCircleIcon,
    DocumentIcon
} from '@heroicons/react/24/outline';
import { formatDuration, formatSize } from '../utils/formatters';

const FILE_ICONS = {
    AUDIO: MicrophoneIcon,
    VIDEO: VideoCameraIcon,
    DOCUMENT: DocumentTextIcon,
    POWERPOINT: DocumentDuplicateIcon,
    OTHER: DocumentIcon
};

const HymnCard = ({ hymn, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700/50 hover:border-blue-100 dark:hover:border-blue-900 overflow-hidden flex flex-col h-full cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link to={`/hymns/${hymn.id}`} className="absolute inset-0 z-0" aria-label={`View details for ${hymn.title}`} />

            {/* Decorative Gradient Blob */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/10 dark:group-hover:bg-blue-500/20 transition-colors duration-500"></div>

            {/* Header */}
            <div className="relative z-10 flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                    <div className={`
            p-2.5 rounded-xl transition-all duration-300
            ${isHovered ? 'bg-blue-500 text-white rotate-3 shadow-lg shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}
          `}>
                        <MusicalNoteIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {hymn.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                            {new Date(hymn.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                    </div>
                </div>

                {/* Floating Actions (Visible on Hover) */}
                <div
                    className={`
                      flex items-center gap-2 transition-all duration-300 relative z-20 
                      ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}
                    `}
                    onClick={(e) => e.stopPropagation()} // Stop click from triggering card navigation
                >
                    <Link
                        to={`/hymns/edit/${hymn.id}`}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-500 hover:text-white transition-colors shadow-sm"
                        title="تعديل"
                    >
                        <PencilIcon className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onDelete(hymn.id);
                        }}
                        className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                        title="حذف"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 relative z-10 space-y-4 pointer-events-none">
                {/* pointer-events-none allows clicks to pass through to the main Link, unless specific interactive elements need their own pointers */}

                {/* Tags */}
                {hymn.tags && hymn.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {hymn.tags.map(tag => (
                            <span
                                key={tag.id}
                                className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600/50"
                            >
                                #{tag.name}
                            </span>
                        ))}
                    </div>
                )}

                {/* Files Preview */}
                {hymn.files && hymn.files.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                        {hymn.files.slice(0, 3).map((file, idx) => {
                            const Icon = FILE_ICONS[file.type] || DocumentIcon;
                            return (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 group/file transition-colors"
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <Icon className="w-4 h-4 text-slate-400 group-hover/file:text-blue-500 transition-colors" />
                                        <span className="text-xs text-slate-600 dark:text-slate-300 truncate font-medium">
                                            {file.type}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                        {formatDuration(file.duration) && (
                                            <span className="flex items-center gap-1">
                                                {formatDuration(file.duration)} <ClockIcon className="w-3 h-3" />
                                            </span>
                                        )}
                                        {formatSize(file.size) && <span>{formatSize(file.size)}</span>}
                                    </div>
                                </div>
                            );
                        })}
                        {hymn.files.length > 3 && (
                            <div className="text-xs text-center text-slate-400 pt-1">
                                +{hymn.files.length - 3} ملفات إضافية
                            </div>
                        )}
                    </div>
                )}

                {/* Lyric Snippet */}
                {hymn.lyric?.content && (
                    <div className="mt-2 relative">
                        <div className="text-sm p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 italic leading-relaxed border border-slate-100 dark:border-slate-800 relative overflow-hidden h-24">
                            "{hymn.lyric.content.substring(0, 150)}..."
                            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-50 dark:from-slate-900/50 to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Glow Bar on Active */}
            <div className={`
        absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform origin-left transition-transform duration-300
        ${isHovered ? 'scale-x-100' : 'scale-x-0'}
      `}></div>
        </div>
    );
};

export default HymnCard;
