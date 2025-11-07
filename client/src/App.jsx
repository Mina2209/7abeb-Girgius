import { BrowserRouter as Router } from 'react-router-dom';
import { HymnProvider } from './contexts/HymnContext';
import { TagProvider } from './contexts/TagContext';
import { SayingProvider } from './contexts/SayingContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">
      <TagProvider>
        <HymnProvider>
          <SayingProvider>
            <Router>
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              <AppRoutes />
            </main>
            <Footer />
            </Router>
          </SayingProvider>
        </HymnProvider>
      </TagProvider>
    </div>
  );
}

export default App;
