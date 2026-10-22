import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Tours from '@/pages/Tours';
import TourDetail from '@/pages/TourDetail';
import Book from '@/pages/Book';
import About from '@/pages/About';
import Faq from '@/pages/Faq';
import Contact from '@/pages/Contact';
import Admin from '@/pages/Admin';
import Destinations from '@/pages/Destinations';
import Destination from '@/pages/Destination';
import Plan from '@/pages/Plan';
import { defaultLanguage } from '@/i18n';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={`/${defaultLanguage}`} replace />} />
        <Route element={<Layout />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/:lang" element={<Home />} />
          <Route path="/:lang/tours" element={<Tours />} />
          <Route path="/:lang/tours/:slug" element={<TourDetail />} />
 <Route path="/:lang/destinations" element={<Destinations />} />
          <Route path="/:lang/destinations/:country" element={<Destination />} />
          <Route path="/:lang/plan" element={<Plan />} />
          <Route path="/:lang/book/:slug" element={<Book />} />
          <Route path="/:lang/about" element={<About />} />
          <Route path="/:lang/faq" element={<Faq />} />
          <Route path="/:lang/contact" element={<Contact />} />
          <Route path="/:lang/admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<Navigate to={`/${defaultLanguage}`} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
