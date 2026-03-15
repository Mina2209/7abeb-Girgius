import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useImages } from '../../contexts/ImageContext';
import { useAuth } from '../../contexts/AuthContext';
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    PhotoIcon,
    ArrowDownTrayIcon,
    SparklesIcon,
    TagIcon,
    UserIcon,
    SwatchIcon,
    CalendarIcon,
    EyeIcon,
    EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { API_BASE } from '../../config/apiConfig';
import ConfirmDialog from '../../components/ConfirmDialog';

const buildImageSrc = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('/api/')) {
        return `${API_BASE.replace('/api', '')}${imageUrl}`;
    }
    return imageUrl;
};

const ImageDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { images, deleteImage } = useImages();
    const { isAdmin, isEditor } = useAuth();
    const [image, setImage] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (images.length > 0) {
            const found = images.find(i => i.id === id);
            setImage(found);
        }
    }, [id, images]);

    if (!image) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    const handleDelete = async () => {
        await deleteImage(id);
        navigate('/image-library');
    };

    const handleDownload = async () => {
        if (isDownloading) return;
        setIsDownloading(true);
        try {
            const src = buildImageSrc(image.imageUrl);
            const response = await fetch(src);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // Use image title as download filename, fallback to 'image'
            const ext = image.imageUrl?.match(/\.(\w+)(?:\?|$)/)?.[1] || 'jpg';
            link.download = `${image.title || 'image'}.${ext}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
            window.open(buildImageSrc(image.imageUrl), '_blank');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header / Nav */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate('/image-library')}
                    className="flex items-center text-slate-500 hover:text-emerald-600 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5 ml-2" />
                    العودة لمكتبة الصور
                </button>

                {isEditor() && (
                    <div className="flex gap-2">
                        <Link
                            to={`/images/edit/${image.id}`}
                            className="flex items-center px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors font-medium border border-emerald-100 dark:border-emerald-800"
                        >
                            <PencilIcon className="w-4 h-4 ml-2" />
                            تعديل
                        </Link>
                        {isAdmin() && (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors font-medium border border-red-100 dark:border-red-800"
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

                {/* Right Column: Image Preview */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        {/* Full Image */}
                        <div className="relative bg-slate-100 dark:bg-slate-900 flex items-center justify-center min-h-[400px]">
                            {image.imageUrl ? (
                                <img
                                    src={buildImageSrc(image.imageUrl)}
                                    alt={image.title}
                                    className="max-w-full max-h-[70vh] object-contain"
                                />
                            ) : (
                                <PhotoIcon className="h-24 w-24 text-slate-300 dark:text-slate-600" />
                            )}
                            {/* AI Badge */}
                            {image.ai && (
                                <div className="absolute top-4 left-4 bg-purple-500/90 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                                    <SparklesIcon className="h-4 w-4" />
                                    مُنشأ بالذكاء الاصطناعي
                                </div>
                            )}
                        </div>

                        {/* Download Bar */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate flex-1 ml-4">
                                {image.title}
                            </h1>
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm ${
                                    isDownloading
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-wait'
                                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white hover:shadow-md'
                                }`}
                            >
                                {isDownloading ? (
                                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <ArrowDownTrayIcon className="w-5 h-5" />
                                )}
                                تحميل الصورة
                            </button>
                        </div>
                    </div>
                </div>

                {/* Left Column: Meta Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Info Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center">
                            <PhotoIcon className="w-5 h-5 ml-2 text-emerald-500" />
                            تفاصيل الصورة
                        </h2>

                        <div className="space-y-4 text-sm">
                            {/* Author */}
                            {image.author && (
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 dark:text-slate-400 flex items-center">
                                        <UserIcon className="w-4 h-4 ml-1.5" />
                                        المؤلف
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-medium">
                                        {image.author.name}
                                    </span>
                                </div>
                            )}

                            {/* Type */}
                            {image.type && (
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 dark:text-slate-400 flex items-center">
                                        <SwatchIcon className="w-4 h-4 ml-1.5" />
                                        النوع
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium">
                                        {image.type.name}
                                    </span>
                                </div>
                            )}

                            {/* Published Status */}
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 dark:text-slate-400 flex items-center">
                                    {image.published ? <EyeIcon className="w-4 h-4 ml-1.5" /> : <EyeSlashIcon className="w-4 h-4 ml-1.5" />}
                                    الحالة
                                </span>
                                <span className={`px-3 py-1 rounded-full font-medium ${
                                    image.published
                                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                                        : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                                }`}>
                                    {image.published ? 'منشور' : 'مسودة'}
                                </span>
                            </div>

                            {/* AI */}
                            {image.ai && (
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 dark:text-slate-400 flex items-center">
                                        <SparklesIcon className="w-4 h-4 ml-1.5" />
                                        الذكاء الاصطناعي
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-medium">
                                        نعم
                                    </span>
                                </div>
                            )}

                            {/* Date */}
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 dark:text-slate-400 flex items-center">
                                    <CalendarIcon className="w-4 h-4 ml-1.5" />
                                    تاريخ الإضافة
                                </span>
                                <span className="text-slate-700 dark:text-slate-300 font-mono text-xs">
                                    {new Date(image.createdAt).toLocaleDateString('ar-EG', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tags Card */}
                    {image.tags && image.tags.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                <TagIcon className="w-5 h-5 ml-2 text-blue-500" />
                                المواضيع
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {image.tags.map(tag => (
                                    <span
                                        key={tag.id}
                                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 font-medium"
                                    >
                                        #{tag.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="تأكيد الحذف"
                message="هل أنت متأكد من أنك تريد حذف هذه الصورة؟ لا يمكن التراجع عن هذا الإجراء."
                confirmLabel="حذف"
                cancelLabel="إلغاء"
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </div>
    );
};

export default ImageDetails;
