import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import HomePage from '../pages/home/HomePage';
import LoginPage from '../pages/LoginPage';
import HymnForm from '../pages/hymns/HymnForm';
import HymnList from '../pages/hymns/HymnList';
import TagList from '../pages/tags/TagList';
import TagForm from '../pages/tags/TagForm';
import LiturgyPage from '../pages/LiturgyPage';
import AgpeyaPage from '../pages/AgpeyaPage';
import ReflectionsPage from '../pages/ReflectionsPage';
import SayingList from '../pages/sayings/SayingList';
import SayingForm from '../pages/sayings/SayingForm';
import ImageLibraryPage from '../pages/ImageLibraryPage';
import SermonsPage from '../pages/SermonsPage';
import ProgramsPage from '../pages/ProgramsPage';
import UserManagement from '../pages/admin/UserManagement';
import LogViewer from '../pages/admin/LogViewer';
import BackupManagement from '../pages/admin/BackupManagement';

// Protected route wrapper for authenticated users
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) return <div>Loading...</div>;
    
    return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

// Protected route wrapper for admin only
function AdminRoute({ children }) {
    const { isAdmin, loading } = useAuth();
    
    if (loading) return <div>Loading...</div>;
    
    return isAdmin() ? children : <Navigate to="/" replace />;
}

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Main pages - require authentication */}
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/liturgy" element={<ProtectedRoute><LiturgyPage /></ProtectedRoute>} />
            <Route path="/agpeya" element={<ProtectedRoute><AgpeyaPage /></ProtectedRoute>} />
            <Route path="/reflections" element={<ProtectedRoute><ReflectionsPage /></ProtectedRoute>} />
            <Route path="/sayings" element={<ProtectedRoute><SayingList /></ProtectedRoute>} />
            <Route path="/image-library" element={<ProtectedRoute><ImageLibraryPage /></ProtectedRoute>} />
            <Route path="/sermons" element={<ProtectedRoute><SermonsPage /></ProtectedRoute>} />
            <Route path="/programs" element={<ProtectedRoute><ProgramsPage /></ProtectedRoute>} />

            {/* Hymns - editors and admins */}
            <Route path="/hymns" element={<ProtectedRoute><HymnList /></ProtectedRoute>} />
            <Route path="/hymns/add" element={<ProtectedRoute><HymnForm /></ProtectedRoute>} />
            <Route path="/hymns/edit/:id" element={<ProtectedRoute><HymnForm /></ProtectedRoute>} />

            {/* Tags - admin only */}
            <Route path="/tags" element={<AdminRoute><TagList /></AdminRoute>} />
            <Route path="/tags/add" element={<AdminRoute><TagForm /></AdminRoute>} />
            <Route path="/tags/edit/:id" element={<AdminRoute><TagForm /></AdminRoute>} />

            {/* Sayings - editors and admins */}
            <Route path="/sayings/new" element={<ProtectedRoute><SayingForm /></ProtectedRoute>} />
            <Route path="/sayings/:id/edit" element={<ProtectedRoute><SayingForm /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
            <Route path="/admin/logs" element={<AdminRoute><LogViewer /></AdminRoute>} />
            <Route path="/admin/backup" element={<AdminRoute><BackupManagement /></AdminRoute>} />
        </Routes>
    );
}
