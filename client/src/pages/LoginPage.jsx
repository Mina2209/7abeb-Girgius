import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import {
  LockClosedIcon,
  UserIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });
  const navigate = useNavigate();
  const { login } = useAuth();

  // Check for redirect after login
  useEffect(() => {
    const redirect = sessionStorage.getItem('redirectAfterLogin');
    if (redirect) {
      sessionStorage.removeItem('redirectAfterLogin');
    }
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!username.trim()) {
      errors.username = 'اسم المستخدم مطلوب';
    } else if (username.length < 3) {
      errors.username = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
    }
    if (!password) {
      errors.password = 'كلمة المرور مطلوبة';
    } else if (password.length < 4) {
      errors.password = 'كلمة المرور يجب أن تكون 4 أحرف على الأقل';
    }
    return errors;
  };

  const formErrors = validateForm();
  const isFormValid = Object.keys(formErrors).length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ username: true, password: true });

    if (!isFormValid) return;

    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        const redirect = sessionStorage.getItem('redirectAfterLogin') || '/';
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirect);
      } else {
        setError(result.error || 'فشل تسجيل الدخول');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4" dir="rtl">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 dark:bg-indigo-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      {/* Theme toggle in corner */}
      <div className="absolute top-4 left-4">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8 space-y-8">
          {/* Logo/Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">منصة حبيب جرجس</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">نظام إدارة المحتوى</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl animate-shake">
              <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                اسم المستخدم
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <UserIcon className={`w-5 h-5 ${touched.username && formErrors.username ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => handleBlur('username')}
                  className={`w-full pr-10 pl-4 py-3 border rounded-xl bg-gray-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                    ${touched.username && formErrors.username
                      ? 'border-red-300 dark:border-red-600 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800 focus:border-red-400'
                      : 'border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400'
                    }`}
                  placeholder="أدخل اسم المستخدم"
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
              {touched.username && formErrors.username && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-4 h-4" />
                  {formErrors.username}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <LockClosedIcon className={`w-5 h-5 ${touched.password && formErrors.password ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`w-full pr-10 pl-12 py-3 border rounded-xl bg-gray-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                    ${touched.password && formErrors.password
                      ? 'border-red-300 dark:border-red-600 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800 focus:border-red-400'
                      : 'border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400'
                    }`}
                  placeholder="أدخل كلمة المرور"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {touched.password && formErrors.password && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-4 h-4" />
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 
                text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 
                disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <LockClosedIcon className="w-5 h-5" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-100 dark:border-slate-700">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              جميع الحقوق محفوظة © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      {/* Add shake animation to global styles */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
