import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HymnProvider } from './contexts/HymnContext';
import { TagProvider } from './contexts/TagContext';
import { SayingProvider } from './contexts/SayingContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">
      <Router>
        <AuthProvider>
          <TagProvider>
            <HymnProvider>
              <SayingProvider>
                <Navbar />
                <main className="flex-grow container mx-auto px-4 py-8">
                  <AppRoutes />
                </main>
                <Footer />
              </SayingProvider>
            </HymnProvider>
          </TagProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
