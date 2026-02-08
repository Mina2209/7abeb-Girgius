// Skeleton loader components for loading states

export const SkeletonCard = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-slate-700 animate-pulse">
        <div className="flex justify-between items-start mb-4">
            <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-lg w-2/3"></div>
            <div className="flex gap-2">
                <div className="h-8 w-8 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
                <div className="h-8 w-8 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
            </div>
        </div>
        <div className="space-y-3">
            <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
                <div className="h-6 w-20 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
        </div>
    </div>
);

export const SkeletonRow = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 border border-gray-100 dark:border-slate-700 animate-pulse">
        <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
            <div className="flex-1">
                <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
            <div className="h-8 w-20 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
    </div>
);

export const SkeletonStats = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-slate-700 animate-pulse">
        <div className="flex items-center justify-between">
            <div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
            </div>
            <div className="h-12 w-12 bg-gray-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
    </div>
);

export const SkeletonForm = () => (
    <div className="space-y-6 animate-pulse">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-slate-700">
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24 mb-3"></div>
            <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded-xl w-full"></div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-slate-700">
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20 mb-3"></div>
            <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded-xl w-full"></div>
        </div>
        <div className="flex justify-end gap-3">
            <div className="h-11 w-24 bg-gray-200 dark:bg-slate-700 rounded-xl"></div>
            <div className="h-11 w-24 bg-gray-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
    </div>
);

export const SkeletonGrid = ({ count = 8, columns = 4 }) => (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} />
        ))}
    </div>
);

export default { SkeletonCard, SkeletonRow, SkeletonStats, SkeletonForm, SkeletonGrid };
