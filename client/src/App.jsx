import { useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { UploadProvider } from './contexts/UploadContext';
import { HymnProvider } from './contexts/HymnContext';
import { TagProvider } from './contexts/TagContext';
import { SayingProvider } from './contexts/SayingContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';
import SessionExpiredModal from './components/SessionExpiredModal';
import UploadIndicator from './components/UploadIndicator';

import { ToastProvider } from './contexts/ToastContext';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200" dir="rtl">
        <AuthProvider>
          <ToastProvider>
            <UploadProvider>
              <TagProvider>
                <HymnProvider>
                  <SayingProvider>
                    {!isLoginPage && <Navbar />}
                    <main className="flex-grow container mx-auto px-4 py-8">
                      <AppRoutes />
                    </main>
                    {!isLoginPage && <Footer />}
                    <SessionExpiredModal />
                    <UploadIndicator />
                  </SayingProvider>
                </HymnProvider>
              </TagProvider>
            </UploadProvider>
          </ToastProvider>
        </AuthProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;
