import { useState, useEffect } from 'react';
import { BackupService } from '../../api';
import {
  ArrowDownTrayIcon,
  TrashIcon,
  PlusIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import ConfirmDialog from '../../components/ConfirmDialog';

const BackupManagement = () => {
  const [backups, setBackups] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch backups and status
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [backupsRes, statusRes] = await Promise.all([
        BackupService.list(),
        BackupService.getStatus()
      ]);
      setBackups(backupsRes.backups || []);
      setStatus(statusRes);
    } catch (err) {
      setError('فشل في جلب النسخ الاحتياطية');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Create a new backup
  const handleCreateBackup = async () => {
    setCreating(true);
    setError('');
    setSuccess('');
    try {
      const result = await BackupService.create();
      setSuccess(`تم إنشاء النسخة الاحتياطية: ${result.backup.filename}`);
      fetchData(); // Refresh list
    } catch (err) {
      setError('فشل في إنشاء النسخة الاحتياطية');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  // Download a backup
  const handleDownload = async (backup) => {
    try {
      const result = await BackupService.getDownloadUrl(backup.key);
      // Open download URL in new tab
      window.open(result.url, '_blank');
      setSuccess(`جاري تحميل: ${backup.filename}`);
    } catch (err) {
      setError('فشل في تحميل النسخة الاحتياطية');
      console.error(err);
    }
  };

  // Delete a backup
  const handleDelete = async (backup) => {
    try {
      await BackupService.delete(backup.key);
      setSuccess(`تم حذف النسخة الاحتياطية: ${backup.filename}`);
      setDeleteConfirm(null);
      fetchData(); // Refresh list
    } catch (err) {
      setError('فشل في حذف النسخة الاحتياطية');
      console.error(err);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Clear messages after delay
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">النسخ الاحتياطية</h1>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-5 w-5 ml-2" />
            تحديث
          </button>
          <button
            onClick={handleCreateBackup}
            disabled={creating}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? (
              <>
                <ArrowPathIcon className="h-5 w-5 ml-2 animate-spin" />
                جاري الإنشاء...
              </>
            ) : (
              <>
                <PlusIcon className="h-5 w-5 ml-2" />
                إنشاء نسخة احتياطية
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
          <ExclamationCircleIcon className="h-5 w-5 ml-2" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
          <CheckCircleIcon className="h-5 w-5 ml-2" />
          {success}
        </div>
      )}

      {/* Status Card */}
      {status && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">حالة النظام</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">الحالة</div>
              <div className="text-lg font-medium text-green-600">
                {status.status === 'operational' ? 'يعمل' : 'خطأ'}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">إجمالي النسخ</div>
              <div className="text-lg font-medium text-gray-900">{status.totalBackups}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">آخر نسخة</div>
              <div className="text-lg font-medium text-gray-900">
                {status.latestBackup ? (
                  <span className="flex items-center">
                    <ClockIcon className="h-4 w-4 ml-1" />
                    {formatDate(status.latestBackup.timestamp)}
                  </span>
                ) : (
                  'لا يوجد'
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backups List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            النسخ الاحتياطية المتاحة ({backups.length})
          </h2>
        </div>

        {backups.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            لا توجد نسخ احتياطية متاحة
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {backups.map((backup) => (
              <li
                key={backup.key}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {backup.filename}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-500">
                      {formatDate(backup.lastModified)}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {backup.sizeFormatted}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(backup)}
                    className="inline-flex items-center p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                    title="تحميل"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(backup)}
                    className="inline-flex items-center p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    title="حذف"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
        <p className="font-medium mb-2">معلومات:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>يتم إنشاء نسخة احتياطية تلقائية كل 24 ساعة</li>
          <li>يتم الاحتفاظ بآخر 7 نسخ احتياطية تلقائياً</li>
          <li>النسخ الاحتياطية مخزنة على S3 للحماية</li>
          <li>يمكنك إنشاء نسخة احتياطية يدوية في أي وقت</li>
        </ul>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف النسخة الاحتياطية "${deleteConfirm?.filename}"؟`}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={() => handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
};

export default BackupManagement;
