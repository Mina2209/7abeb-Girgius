import { useAuth } from '../../contexts/AuthContext';
import { useHymns } from '../../contexts/HymnContext';
import { useTags } from '../../contexts/TagContext';
import { useSayings } from '../../contexts/SayingContext';
import { Link } from 'react-router-dom';
import {
  MusicalNoteIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  PlusCircleIcon,
  BookOpenIcon,
  PhotoIcon,
  VideoCameraIcon,
  ComputerDesktopIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const { user } = useAuth();
  const { hymns, loading: hymnsLoading } = useHymns();
  const { tags, loading: tagsLoading } = useTags();
  const { sayings, loading: sayingsLoading } = useSayings();

  const stats = [
    {
      label: 'ترانيم',
      value: hymnsLoading ? '...' : hymns.length,
      icon: MusicalNoteIcon,
      color: 'from-blue-500 to-indigo-500',
      href: '/hymns'
    },
    {
      label: 'مواضيع',
      value: tagsLoading ? '...' : tags.length,
      icon: TagIcon,
      color: 'from-emerald-500 to-teal-500',
      href: '/tags'
    },
    {
      label: 'اقوال اباء',
      value: sayingsLoading ? '...' : sayings.length,
      icon: ChatBubbleLeftRightIcon,
      color: 'from-amber-500 to-orange-500',
      href: '/sayings'
    },
  ];

  const quickActions = [
    { label: 'إضافة ترنيمة', icon: PlusCircleIcon, href: '/hymns/add', color: 'blue' },
    { label: 'إضافة قول', icon: ChatBubbleLeftRightIcon, href: '/sayings/new', color: 'amber' },
    { label: 'ليتورجيا', icon: BookOpenIcon, href: '/liturgy', color: 'purple' },
    { label: 'مكتبة صور', icon: PhotoIcon, href: '/image-library', color: 'emerald' },
    { label: 'مكتبة عظات', icon: VideoCameraIcon, href: '/sermons', color: 'rose' },
    { label: 'برامج', icon: ComputerDesktopIcon, href: '/programs', color: 'indigo' },
  ];

  const colorVariants = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
    rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6bTAgMGMwLTItMi00LTItNHMtMiAyLTIgNCAyIDQgMiA0IDItMiAyLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="relative">
          <h1 className="text-3xl font-bold mb-2">
            أهلاً بك، {user?.username || 'مستخدم'}! 👋
          </h1>
          <p className="text-blue-100 text-lg">
            مرحباً بك في منصة حبيب جرجس لإدارة المحتوى
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Link
            key={index}
            to={stat.href}
            className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowLeftIcon className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></span>
          إجراءات سريعة
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 ${colorVariants[action.color]}`}
            >
              <action.icon className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium text-center">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Hymns */}
      {hymns.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></span>
              أحدث الترانيم
            </h2>
            <Link
              to="/hymns"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              عرض الكل
              <ArrowLeftIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hymns.slice(0, 6).map((hymn) => (
              <Link
                key={hymn.id}
                to={`/hymns/edit/${hymn.id}`}
                className="group p-4 rounded-lg border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <MusicalNoteIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 dark:text-white truncate">
                      {hymn.title}
                    </h3>
                    {hymn.tags && hymn.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {hymn.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag.id}
                            className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300 rounded-full"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
