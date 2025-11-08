import { Routes, Route } from 'react-router-dom';

import HomePage from '../pages/home/HomePage';
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

export default function AppRoutes() {
    return (
        <Routes>
            {/* Main pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/liturgy" element={<LiturgyPage />} />
            <Route path="/agpeya" element={<AgpeyaPage />} />
            <Route path="/reflections" element={<ReflectionsPage />} />
            <Route path="sayings" element={<SayingList />} />
            <Route path="/image-library" element={<ImageLibraryPage />} />
            <Route path="/sermons" element={<SermonsPage />} />
            <Route path="/programs" element={<ProgramsPage />} />

            {/* Hymns */}
            <Route path="/hymns" element={<HymnList />} />
            <Route path="/hymns/add" element={<HymnForm />} />
            <Route path="/hymns/edit/:id" element={<HymnForm />} />

            {/* Tags */}
            <Route path="/tags" element={<TagList />} />
            <Route path="/tags/add" element={<TagForm />} />
            <Route path="/tags/edit/:id" element={<TagForm />} />

            {/* Sayings */}
            <Route path="sayings/new" element={<SayingForm />} />
            <Route path="sayings/:id/edit" element={<SayingForm />} />
        </Routes>
    );
}
