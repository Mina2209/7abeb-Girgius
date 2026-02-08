import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useHymns } from '../../contexts/HymnContext';
import { useAuth } from '../../contexts/AuthContext';
import {
    ClockIcon,
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    MusicalNoteIcon,
    VideoCameraIcon,
    DocumentTextIcon,
    DocumentDuplicateIcon,
    DocumentIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { formatDuration, formatSize } from '../../utils/formatters';

const FILE_ICONS = {
    AUDIO: MusicalNoteIcon,
    MUSIC_AUDIO: MusicalNoteIcon,
    VIDEO: VideoCameraIcon,
    VIDEO_MONTAGE: VideoCameraIcon,
    VIDEO_POWERPOINT: VideoCameraIcon,
    DOCUMENT: DocumentTextIcon,
    POWERPOINT: DocumentDuplicateIcon,
    OTHER: DocumentIcon
};

// Get display filename - prefer database's originalName, fallback to URL extraction
function getDisplayFilename(file) {
    // If we have originalName from database, use it (this preserves Arabic chars)
    if (file.originalName) {
        return file.originalName;
    }

    // Fallback: extract from URL/S3 key
    const fileUrl = file.fileUrl;
    if (!fileUrl) return 'file';
    try {
        // Extract key from URL like /api/uploads/url?key=...
        const url = new URL(fileUrl, window.location.origin);
        const key = url.searchParams.get('key');
        if (!key) return 'file';

        // Get the last part after the final slash (the actual filename part)
        const parts = key.split('/');
        const filename = parts[parts.length - 1];

        // The format is: timestamp-random-originalFilename
        const match = filename.match(/^\d+-\d+-(.+)$/);
        if (match && match[1]) {
            return match[1];
        }
        return filename;
    } catch {
        return 'file';
    }
}

const HymnDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { hymns, deleteHymn } = useHymns();
    const { isAdmin, isEditor } = useAuth();
    const [hymn, setHymn] = useState(null);

    // Fetch hymn from context (assuming context has all or we handle single fetch)
    // NOTE: If context only loads list, we might need a fetchSingle from API. 
    // For now try context.
    useEffect(() => {
        if (hymns.length > 0) {
            const found = hymns.find(h => h.id === id);
            setHymn(found);
        }
    }, [id, hymns]);

    if (!hymn) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const handleDelete = async () => {
        if (window.confirm('هل أنت متأكد من حذف هذه الترنيمة؟')) {
            await deleteHymn(id);
            navigate('/hymns');
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header / Nav */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate('/hymns')}
                    className="flex items-center text-slate-500 hover:text-blue-600 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5 ml-2" />
                    العودة للقائمة
                </button>

                {isEditor() && (
                    <div className="flex gap-2">
                        <Link
                            to={`/hymns/edit/${hymn.id}`}
                            className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium border border-blue-100"
                        >
                            <PencilIcon className="w-4 h-4 ml-2" />
                            تعديل
                        </Link>
                        {isAdmin() && (
                            <button
                                onClick={handleDelete}
                                className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium border border-red-100"
                            >
                                <TrashIcon className="w-4 h-4 ml-2" />
                                حذف
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Right Column: Info & Files */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Meta Info Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 leading-relaxed">
                            {hymn.title}
                        </h1>
                        <div className="text-sm text-slate-500 space-y-3 font-mono">
                            <div className="flex items-center justify-between">
                                <span>تاريخ الإضافة:</span>
                                <span className="text-slate-700 dark:text-slate-300">
                                    {new Date(hymn.createdAt).toLocaleDateString('ar-EG')}
                                </span>
                            </div>
                            {/* Tags */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                <h3 className="text-xs font-bold text-slate-400 mb-2">المواضيع</h3>
                                <div className="flex flex-wrap gap-2">
                                    {hymn.tags && hymn.tags.map(tag => (
                                        <span key={tag.id} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md text-xs text-slate-600 dark:text-slate-300">
                                            #{tag.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Files List */}
                    {hymn.files && hymn.files.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                            <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                <DocumentIcon className="w-5 h-5 ml-2 text-blue-500" />
                                الملفات المرفقة
                            </h2>
                            <div className="space-y-3">
                                {hymn.files.map((file, idx) => {
                                    const Icon = FILE_ICONS[file.type] || DocumentIcon;
                                    const isMedia = ['MUSIC_AUDIO', 'VIDEO_MONTAGE', 'VIDEO_POWERPOINT', 'AUDIO', 'VIDEO'].includes(file.type);

                                    return (
                                        <div key={idx} className="group">
                                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                                                <div className="flex items-center gap-3">
                                                    <a
                                                        href={file.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                                                    >
                                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-blue-500 flex-shrink-0">
                                                            <Icon className="w-5 h-5" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors truncate">
                                                                {getDisplayFilename(file)}
                                                            </p>
                                                            <p className="text-xs text-slate-400 font-mono">
                                                                {file.type} • {formatSize(file.size)}
                                                                {formatDuration(file.duration) && ` • ${formatDuration(file.duration)}`}
                                                            </p>
                                                        </div>
                                                    </a>
                                                    <button
                                                        type="button"
                                                        className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors flex-shrink-0"
                                                        title="تحميل الملف"
                                                        onClick={() => {
                                                            // The server redirects to S3 with Content-Disposition header set
                                                            const link = document.createElement('a');
                                                            link.href = file.fileUrl;
                                                            link.target = '_blank';
                                                            link.rel = 'noopener noreferrer';
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            document.body.removeChild(link);
                                                        }}
                                                    >
                                                        <ArrowDownTrayIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Inline Player for Media */}
                                            {isMedia && (
                                                <div className="mt-2 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
                                                    {file.type.includes('AUDIO') ? (
                                                        <audio controls className="w-full bg-slate-100 dark:bg-slate-800 h-10" preload="metadata">
                                                            <source src={file.fileUrl} />
                                                        </audio>
                                                    ) : (
                                                        <video controls className="w-full bg-black aspect-video" preload="metadata">
                                                            <source src={file.fileUrl} />
                                                        </video>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Left Column: Lyrics */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 min-h-[500px]">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-4 flex items-center">
                            <DocumentTextIcon className="w-6 h-6 ml-3 text-slate-400" />
                            كلمات الترنيمة
                        </h2>
                        {hymn.lyric?.content ? (
                            <div className="prose dark:prose-invert max-w-none font-serif text-lg leading-loose text-slate-700 dark:text-slate-300 whitespace-pre-line">
                                {hymn.lyric.content}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-slate-400 italic">
                                لا توجد كلمات مضافة لهذه الترنيمة
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div >
    );
};

export default HymnDetails;
