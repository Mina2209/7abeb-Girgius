import { createContext, useContext, useState, useCallback } from 'react';
import {
    CheckCircleIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
    XMarkIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const TOAST_DURATION = 4000;

const toastStyles = {
    success: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/40',
        border: 'border-emerald-200 dark:border-emerald-700',
        icon: 'text-emerald-500 dark:text-emerald-400',
        text: 'text-emerald-800 dark:text-emerald-200',
        progress: 'bg-emerald-500'
    },
    error: {
        bg: 'bg-red-50 dark:bg-red-900/40',
        border: 'border-red-200 dark:border-red-700',
        icon: 'text-red-500 dark:text-red-400',
        text: 'text-red-800 dark:text-red-200',
        progress: 'bg-red-500'
    },
    warning: {
        bg: 'bg-amber-50 dark:bg-amber-900/40',
        border: 'border-amber-200 dark:border-amber-700',
        icon: 'text-amber-500 dark:text-amber-400',
        text: 'text-amber-800 dark:text-amber-200',
        progress: 'bg-amber-500'
    },
    info: {
        bg: 'bg-blue-50 dark:bg-blue-900/40',
        border: 'border-blue-200 dark:border-blue-700',
        icon: 'text-blue-500 dark:text-blue-400',
        text: 'text-blue-800 dark:text-blue-200',
        progress: 'bg-blue-500'
    }
};

const icons = {
    success: CheckCircleIcon,
    error: ExclamationCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
};

const Toast = ({ toast, onDismiss }) => {
    const styles = toastStyles[toast.type];
    const Icon = icons[toast.type];

    return (
        <div
            className={`relative flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm ${styles.bg} ${styles.border} animate-slide-in overflow-hidden`}
            role="alert"
        >
            {/* Progress bar */}
            <div
                className={`absolute bottom-0 left-0 h-1 ${styles.progress} animate-progress`}
                style={{ animationDuration: `${TOAST_DURATION}ms` }}
            />

            <Icon className={`w-5 h-5 flex-shrink-0 ${styles.icon}`} />

            <div className="flex-1 min-w-0">
                {toast.title && (
                    <p className={`font-semibold ${styles.text}`}>{toast.title}</p>
                )}
                <p className={`text-sm ${styles.text} ${toast.title ? 'mt-1 opacity-80' : ''}`}>
                    {toast.message}
                </p>
            </div>

            <button
                onClick={() => onDismiss(toast.id)}
                className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${styles.text}`}
            >
                <XMarkIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((type, message, title = null) => {
        const id = Date.now() + Math.random();
        const toast = { id, type, message, title };

        setToasts(prev => [...prev, toast]);

        // Auto-dismiss
        setTimeout(() => {
            dismiss(id);
        }, TOAST_DURATION);

        return id;
    }, [dismiss]);

    const toast = {
        success: (message, title) => addToast('success', message, title),
        error: (message, title) => addToast('error', message, title),
        warning: (message, title) => addToast('warning', message, title),
        info: (message, title) => addToast('info', message, title),
        dismiss
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}

            {/* Toast container */}
            <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <Toast toast={t} onDismiss={dismiss} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;
