import { Link } from 'react-router-dom';
import {
    FolderPlusIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

// Reusable empty state component with different variants

const EmptyState = ({
    icon: Icon = FolderPlusIcon,
    title = 'لا توجد بيانات',
    description = 'لم يتم العثور على أي نتائج',
    action = null,
    actionLabel = 'إضافة جديد',
    actionHref = null,
    onAction = null,
    variant = 'default' // 'default', 'search', 'error'
}) => {
    const variants = {
        default: {
            iconBg: 'bg-blue-50 dark:bg-blue-900/30',
            iconColor: 'text-blue-500 dark:text-blue-400',
            buttonBg: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
        },
        search: {
            iconBg: 'bg-gray-100 dark:bg-slate-700',
            iconColor: 'text-gray-400 dark:text-gray-500',
            buttonBg: 'bg-gray-600 hover:bg-gray-700 dark:bg-slate-600 dark:hover:bg-slate-500'
        },
        error: {
            iconBg: 'bg-red-50 dark:bg-red-900/30',
            iconColor: 'text-red-500 dark:text-red-400',
            buttonBg: 'bg-red-500 hover:bg-red-600'
        }
    };

    const style = variants[variant];
    const DisplayIcon = variant === 'search' ? MagnifyingGlassIcon : variant === 'error' ? ArrowPathIcon : Icon;

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-slate-700">
            <div className={`p-4 rounded-2xl ${style.iconBg} mb-4`}>
                <DisplayIcon className={`w-12 h-12 ${style.iconColor}`} />
            </div>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 text-center">
                {title}
            </h3>

            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                {description}
            </p>

            {(actionHref || onAction) && (
                actionHref ? (
                    <Link
                        to={actionHref}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${style.buttonBg}`}
                    >
                        <Icon className="w-5 h-5" />
                        {actionLabel}
                    </Link>
                ) : (
                    <button
                        onClick={onAction}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${style.buttonBg}`}
                    >
                        <DisplayIcon className="w-5 h-5" />
                        {actionLabel}
                    </button>
                )
            )}
        </div>
    );
};

export default EmptyState;
