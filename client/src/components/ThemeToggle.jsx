import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const ThemeToggle = () => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 
        transition-all duration-200 shadow-sm hover:shadow"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? (
                <SunIcon className="w-5 h-5 text-amber-500" />
            ) : (
                <MoonIcon className="w-5 h-5 text-slate-600" />
            )}
        </button>
    );
};

export default ThemeToggle;
