import { useAuth } from '../contexts/AuthContext';
import { useUpload } from '../contexts/UploadContext';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const SessionExpiredModal = () => {
    const { sessionExpired, dismissSessionExpired } = useAuth();
    const { activeCount } = useUpload();

    if (!sessionExpired) return null;

    const handleLoginRedirect = () => {
        // Store current path for redirect after login
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        dismissSessionExpired();
        window.location.href = '/login';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full">
                        <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">انتهت الجلسة</h2>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-gray-600 dark:text-gray-300 text-center">
                        انتهت جلستك بسبب عدم النشاط لفترة طويلة.
                        <br />
                        يرجى تسجيل الدخول مرة أخرى للمتابعة.
                    </p>

                    {activeCount > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                <span className="font-medium">
                                    لديك {activeCount} عملية تحميل جارية
                                </span>
                            </div>
                            <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                                سيتم استئناف التحميلات بعد تسجيل الدخول
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                    <button
                        onClick={handleLoginRedirect}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 
              hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl
              shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                        تسجيل الدخول مرة أخرى
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionExpiredModal;
