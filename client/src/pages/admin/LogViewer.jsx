import { useState, useEffect } from 'react';
import { authService } from '../../api/authService';
import { useAuth } from '../../contexts/AuthContext';

export default function LogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    entity: '',
    limit: 100
  });
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin()) {
      fetchLogs();
    }
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await authService.getAllLogs(filters);
      setLogs(data);
      setError('');
    } catch (err) {
      setError('Failed to load logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'LOGIN':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAdmin()) {
    return <div className="p-4 text-red-600">Access Denied: Admin only</div>;
  }

  if (loading) {
    return <div className="p-4">Loading logs...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Activity Logs</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Entity</label>
            <select
              value={filters.entity}
              onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">All Entities</option>
              <option value="HYMN">Hymns</option>
              <option value="SAYING">Sayings</option>
              <option value="TAG">Tags</option>
              <option value="USER">Users</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Limit</label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {log.user?.username || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        log.user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {log.user?.role || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.entity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-md truncate">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing {logs.length} log entries
        </div>
      )}
    </div>
  );
}
