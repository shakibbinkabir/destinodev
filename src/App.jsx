import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingContact from './components/FloatingContact';
import HomePage from './pages/HomePage';
import StockListPage from './pages/StockListPage';
import SingleCarPage from './pages/SingleCarPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import DeliveredPage from './pages/DeliveredPage';
import AuctionPage from './pages/AuctionPage';
import ShippingPage from './pages/ShippingPage';
import NotFoundPage from './pages/NotFoundPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stock" element={<StockListPage />} />
          <Route path="/stock/:id" element={<SingleCarPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/delivered" element={<DeliveredPage />} />
          <Route path="/auction" element={<AuctionPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <FloatingContact />
    </>
  );
}
