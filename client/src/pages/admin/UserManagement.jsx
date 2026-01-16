import { useState, useEffect } from 'react';
import { authService } from '../../api/authService';
import { useAuth } from '../../contexts/AuthContext';
import {
  UserPlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationCircleIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'EDITOR'
  });
  const [formErrors, setFormErrors] = useState({});
  const { isAdmin, user: currentUser } = useAuth();

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
    }
  }, []);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await authService.getAllUsers();
      setUsers(data);
      setError('');
    } catch (err) {
      setError('فشل في تحميل المستخدمين. يرجى تحديث الصفحة.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) {
      errors.username = 'اسم المستخدم مطلوب';
    } else if (formData.username.length < 3) {
      errors.username = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط';
    }
    
    if (!editingUser && !formData.password) {
      errors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    
    return errors;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    
    setSubmitting(true);
    try {
      await authService.createUser(formData);
      setShowCreateForm(false);
      setFormData({ username: '', password: '', role: 'EDITOR' });
      setFormErrors({});
      setSuccess(`تم إنشاء المستخدم "${formData.username}" بنجاح`);
      fetchUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'فشل في إنشاء المستخدم';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    
    setSubmitting(true);
    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      await authService.updateUser(editingUser.id, updateData);
      setEditingUser(null);
      setFormData({ username: '', password: '', role: 'EDITOR' });
      setFormErrors({});
      setSuccess(`تم تحديث المستخدم "${formData.username}" بنجاح`);
      fetchUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'فشل في تحديث المستخدم';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm) return;
    
    setSubmitting(true);
    try {
      await authService.deleteUser(deleteConfirm.id);
      setSuccess(`تم حذف المستخدم "${deleteConfirm.username}" بنجاح`);
      setDeleteConfirm(null);
      fetchUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'فشل في حذف المستخدم';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setShowCreateForm(false);
    setFormData({
      username: user.username,
      password: '',
      role: user.role
    });
    setFormErrors({});
    setShowPassword(false);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setShowCreateForm(false);
    setFormData({ username: '', password: '', role: 'EDITOR' });
    setFormErrors({});
    setShowPassword(false);
  };

  const openCreateForm = () => {
    setShowCreateForm(true);
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'EDITOR' });
    setFormErrors({});
    setShowPassword(false);
  };

  if (!isAdmin()) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" dir="rtl">
        <div className="text-center bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">غير مصرح</h2>
          <p className="text-red-600">هذه الصفحة متاحة للمديرين فقط</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
            إدارة المستخدمين
          </h1>
          <p className="text-gray-500 mt-1">إدارة حسابات المستخدمين والصلاحيات</p>
        </div>
        <button
          onClick={openCreateForm}
          disabled={showCreateForm}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 
            text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
        >
          <UserPlusIcon className="w-5 h-5" />
          إضافة مستخدم جديد
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 animate-fadeIn">
          <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
          <p className="flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 animate-fadeIn">
          <CheckIcon className="w-5 h-5 flex-shrink-0" />
          <p className="flex-1">{success}</p>
          <button onClick={() => setSuccess('')} className="text-green-400 hover:text-green-600">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Create/Edit Form */}
      {(showCreateForm || editingUser) && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 animate-slideDown">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              {editingUser ? (
                <>
                  <PencilSquareIcon className="w-6 h-6 text-amber-500" />
                  تعديل المستخدم
                </>
              ) : (
                <>
                  <UserPlusIcon className="w-6 h-6 text-blue-500" />
                  إضافة مستخدم جديد
                </>
              )}
            </h2>
            <button
              onClick={cancelEdit}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <UserCircleIcon className={`w-5 h-5 ${formErrors.username ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={`w-full pr-10 pl-4 py-3 border rounded-xl bg-gray-50 focus:bg-white transition-colors
                      ${formErrors.username 
                        ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400' 
                        : 'border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400'
                      }
                      ${editingUser ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="أدخل اسم المستخدم"
                    disabled={editingUser || submitting}
                  />
                </div>
                {formErrors.username && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    {formErrors.username}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  كلمة المرور
                  {editingUser && <span className="text-gray-400 font-normal"> (اتركها فارغة للإبقاء على الحالية)</span>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ShieldCheckIcon className={`w-5 h-5 ${formErrors.password ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full pr-10 pl-12 py-3 border rounded-xl bg-gray-50 focus:bg-white transition-colors
                      ${formErrors.password 
                        ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400' 
                        : 'border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400'
                      }`}
                    placeholder={editingUser ? 'أدخل كلمة مرور جديدة (اختياري)' : 'أدخل كلمة المرور'}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    {formErrors.password}
                  </p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">الصلاحية</label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all
                    ${formData.role === 'EDITOR' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                    <input
                      type="radio"
                      name="role"
                      value="EDITOR"
                      checked={formData.role === 'EDITOR'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="sr-only"
                      disabled={submitting}
                    />
                    <UserCircleIcon className="w-6 h-6" />
                    <div>
                      <div className="font-medium">محرر</div>
                      <div className="text-xs opacity-75">يمكنه إضافة وتعديل المحتوى</div>
                    </div>
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all
                    ${formData.role === 'ADMIN' 
                      ? 'border-purple-500 bg-purple-50 text-purple-700' 
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                    <input
                      type="radio"
                      name="role"
                      value="ADMIN"
                      checked={formData.role === 'ADMIN'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="sr-only"
                      disabled={submitting}
                    />
                    <ShieldCheckIcon className="w-6 h-6" />
                    <div>
                      <div className="font-medium">مدير</div>
                      <div className="text-xs opacity-75">صلاحيات كاملة</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={cancelEdit}
                disabled={submitting}
                className="px-5 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 
                  text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    {editingUser ? 'تحديث' : 'إنشاء'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="inline-flex items-center gap-3 text-gray-500">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            جاري تحميل المستخدمين...
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <UserCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">لا يوجد مستخدمين</h3>
          <p className="text-gray-400">قم بإضافة مستخدم جديد للبدء</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    المستخدم
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    الصلاحية
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    تاريخ الإنشاء
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center
                          ${user.role === 'ADMIN' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                          {user.role === 'ADMIN' ? (
                            <ShieldCheckIcon className="w-5 h-5 text-purple-600" />
                          ) : (
                            <UserCircleIcon className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.username}</div>
                          {currentUser?.id === user.id && (
                            <span className="text-xs text-blue-500">(أنت)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                        ${user.role === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'}`}>
                        {user.role === 'ADMIN' ? (
                          <>
                            <ShieldCheckIcon className="w-3.5 h-3.5" />
                            مدير
                          </>
                        ) : (
                          <>
                            <UserCircleIcon className="w-3.5 h-3.5" />
                            محرر
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user)}
                          disabled={currentUser?.id === user.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={currentUser?.id === user.id ? 'لا يمكنك حذف حسابك' : 'حذف'}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {users.map((user) => (
              <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center
                      ${user.role === 'ADMIN' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                      {user.role === 'ADMIN' ? (
                        <ShieldCheckIcon className="w-5 h-5 text-purple-600" />
                      ) : (
                        <UserCircleIcon className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.username}
                        {currentUser?.id === user.id && (
                          <span className="text-xs text-blue-500 mr-1">(أنت)</span>
                        )}
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                        ${user.role === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'}`}>
                        {user.role === 'ADMIN' ? 'مدير' : 'محرر'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(user)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(user)}
                      disabled={currentUser?.id === user.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  تم الإنشاء: {new Date(user.createdAt).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="حذف المستخدم"
        message={`هل أنت متأكد من حذف المستخدم "${deleteConfirm?.username}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteConfirm(null)}
        variant="danger"
      />

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
