import { useState, useEffect } from 'react';
import { useUpload, UPLOAD_STATUS } from '../contexts/UploadContext';
import {
    XMarkIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    DocumentIcon,
    CloudArrowUpIcon,
    TrashIcon,
    ChevronDoubleLeftIcon
} from '@heroicons/react/24/outline';

const UploadIndicator = () => {
    const {
        uploads,
        removeUpload,
        cancelUpload,
        clearCompleted,
        activeCount,
        hasErrors
    } = useUpload();

    const [collapsed, setCollapsed] = useState(true);
    const [hovering, setHovering] = useState(false);

    // Auto-expand only on NEW activity, but respect manual override
    // We'll use a ref or simplified logic: 
    // If activeCount increases, expand partially.
    // For now, let's keep it simple: Expand on mount if active, then let user control.

    // Actually, user wants it collapsible.
    // We will remove the "force open on leaving" behavior.

    useEffect(() => {
        if (activeCount > 0 || hasErrors) {
            // Only auto-expand if it's a fresh start, otherwise let user control
            // We won't force it open to avoid annoying the user.
            // Maybe just flash it?
            // For now, let's auto-expand once.
            // setCollapsed(false);
        }
    }, [activeCount, hasErrors]);

    if (uploads.length === 0) return null;

    const overallProgress = uploads.length > 0
        ? uploads.reduce((acc, curr) => acc + curr.progress, 0) / uploads.length
        : 0;

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    };

    return (
        <div
            className={`fixed bottom-8 left-0 z-50 flex items-end transition-all duration-500 ease-in-out ${collapsed && !hovering ? 'translate-x-[calc(100%-60px)]' : 'translate-x-0'}`}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            dir="ltr"
        >
            {/* Main Panel Container */}
            <div className={`
                relative bg-slate-900/90 dark:bg-slate-900/95 
                backdrop-blur-xl border-r-4 border-y border-l 
                ${hasErrors ? 'border-r-red-500' : activeCount > 0 ? 'border-r-blue-500' : 'border-r-emerald-500'}
                border-y-slate-700/50 border-l-slate-700/50
                shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-r-2xl overflow-hidden
                transition-all duration-500 ease-out
                ${collapsed && !hovering ? 'w-[60px] h-[60px] rounded-2xl ml-4 cursor-pointer' : 'w-80 min-h-[300px] rounded-r-2xl'}
            `}
                // If collapsed, clicking anywhere expands it
                onClick={() => { if (collapsed) setCollapsed(false); }}
            >

                {/* Collapsed State (Icon Only) */}
                <div className={`
                    absolute inset-0 flex items-center justify-center 
                    transition-opacity duration-300 
                    ${collapsed && !hovering ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                `}>
                    <div className="relative">
                        <CloudArrowUpIcon className={`w-8 h-8 ${activeCount > 0 ? 'text-blue-400 animate-pulse' : 'text-emerald-400'}`} />
                        {activeCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white font-bold">
                                {activeCount}
                            </span>
                        )}
                        {/* Circular progress behind icon */}
                        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 -rotate-90 pointer-events-none">
                            <circle
                                cx="24" cy="24" r="22"
                                fill="none" strokeWidth="2"
                                className="stroke-slate-700"
                            />
                            <circle
                                cx="24" cy="24" r="22"
                                fill="none" strokeWidth="2"
                                className={`stroke-current ${activeCount > 0 ? 'text-blue-500' : 'text-emerald-500'}`}
                                strokeDasharray={138}
                                strokeDashoffset={138 - (138 * overallProgress) / 100}
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                </div>

                {/* Expanded State (Full List) */}
                <div className={`
                    flex flex-col h-full w-full
                    transition-opacity duration-300 delay-100
                    ${collapsed && !hovering ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                `}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-slate-800 ${activeCount > 0 ? 'text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-emerald-400'}`}>
                                <CloudArrowUpIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white tracking-wide">UPLOADS</h3>
                                <p className="text-xs text-slate-400 font-mono">
                                    {activeCount > 0 ? `${activeCount} active` : 'All completed'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {/* Collapse Button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setCollapsed(true); }}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                title="Collapse"
                            >
                                <ChevronDoubleLeftIcon className="w-4 h-4" />
                            </button>
                            {uploads.some(u => u.status === UPLOAD_STATUS.COMPLETED || u.status === UPLOAD_STATUS.ERROR) && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); clearCompleted(); }}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                    title="Clear completed"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Scrollable list */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
                        {uploads.map(upload => (
                            <div key={upload.id} className="group relative">
                                {/* Item Background with Glow */}
                                <div className={`
                                    absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
                                    bg-gradient-to-r from-blue-500/20 to-purple-500/5 blur-lg
                                `}></div>

                                <div className="relative flex items-start gap-3">
                                    {/* Icon Box */}
                                    <div className={`
                                        shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                                        bg-slate-800 border border-slate-700
                                        ${upload.status === UPLOAD_STATUS.UPLOADING ? 'text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : ''}
                                        ${upload.status === UPLOAD_STATUS.COMPLETED ? 'text-emerald-400' : ''}
                                        ${upload.status === UPLOAD_STATUS.ERROR ? 'text-red-400' : ''}
                                    `}>
                                        {upload.status === UPLOAD_STATUS.UPLOADING && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
                                        {upload.status === UPLOAD_STATUS.COMPLETED && <CheckCircleIcon className="w-5 h-5" />}
                                        {upload.status === UPLOAD_STATUS.ERROR && <ExclamationCircleIcon className="w-5 h-5" />}
                                        {upload.status === UPLOAD_STATUS.PENDING && <DocumentIcon className="w-5 h-5 text-slate-500" />}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-medium text-slate-200 truncate pr-2" title={upload.filename}>
                                                {upload.filename}
                                            </h4>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); upload.status === UPLOAD_STATUS.UPLOADING ? cancelUpload(upload.id) : removeUpload(upload.id); }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-center mt-1 text-[10px] text-slate-500 font-mono">
                                            <span>{formatFileSize(upload.size)}</span>
                                            <span>{Math.round(upload.progress)}%</span>
                                        </div>

                                        {/* Progress Bar Container */}
                                        <div className="h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden border border-slate-700/50">
                                            <div
                                                className={`h-full transition-all duration-300 relative
                                                    ${upload.status === UPLOAD_STATUS.COMPLETED ? 'bg-emerald-500' : 'bg-blue-500'}
                                                    ${upload.status === UPLOAD_STATUS.ERROR ? 'bg-red-500' : ''}
                                                `}
                                                style={{ width: `${upload.progress}%` }}
                                            >
                                                {/* Animated Glare */}
                                                {upload.status === UPLOAD_STATUS.UPLOADING && (
                                                    <div className="absolute inset-0 bg-white/30 w-full animate-[shimmer_1.5s_infinite] skew-x-12"></div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status Text */}
                                        {upload.error && (
                                            <p className="text-[10px] text-red-400 mt-1">{upload.error}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Styles for shimmer animation */}
            <style>{`
                @keyframes shimmer {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

export default UploadIndicator;
