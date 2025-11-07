import { Routes, Route } from 'react-router-dom';

import HomePage from '../pages/HomePage';
import HymnForm from '../pages/HymnForm';
import HymnFilter from '../pages/HymnFilter';
import TagList from '../pages/TagList';
import TagForm from '../pages/TagForm';
import LiturgyPage from '../pages/LiturgyPage';
import AgpeyaPage from '../pages/AgpeyaPage';
import ReflectionsPage from '../pages/ReflectionsPage';
import FathersQuotesPage from '../pages/FathersQuotesPage';
import SayingForm from '../pages/SayingForm';
import ImageLibraryPage from '../pages/ImageLibraryPage';
import SermonsPage from '../pages/SermonsPage';
import ProgramsPage from '../pages/ProgramsPage';

export default function AppRoutes() {
    return (
        <Routes>
            {/* Main pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/liturgy" element={<LiturgyPage />} />
            <Route path="/agpeya" element={<AgpeyaPage />} />
            <Route path="/reflections" element={<ReflectionsPage />} />
            <Route path="/fathers-quotes" element={<FathersQuotesPage />} />
            <Route path="/image-library" element={<ImageLibraryPage />} />
            <Route path="/sermons" element={<SermonsPage />} />
            <Route path="/programs" element={<ProgramsPage />} />

            {/* Hymns */}
            <Route path="/hymns" element={<HymnFilter />} />
            <Route path="/hymns/add" element={<HymnForm />} />
            <Route path="/hymns/edit/:id" element={<HymnForm />} />

            {/* Tags */}
            <Route path="/tags" element={<TagList />} />
            <Route path="/tags/add" element={<TagForm />} />
            <Route path="/tags/edit/:id" element={<TagForm />} />

            {/* Sayings */}
            <Route path="/fathers-quotes/new" element={<SayingForm />} />
            <Route path="/fathers-quotes/:id/edit" element={<SayingForm />} />
        </Routes>
    );
}
