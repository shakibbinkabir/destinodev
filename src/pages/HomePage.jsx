import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Globe, DollarSign, UserCheck, ArrowRight } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import StatsStrip from '../components/StatsStrip';
import CarCard from '../components/CarCard';
import ProcessSteps from '../components/ProcessSteps';
import TestimonialSlider from '../components/TestimonialSlider';
import CTABanner from '../components/CTABanner';
import { cars } from '../data/cars';
import './HomePage.css';

const heroImages = [
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1600&h=900&fit=crop',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&h=900&fit=crop',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&h=900&fit=crop',
];

const usps = [
  {
    icon: ShieldCheck,
    title: "Certified Inspection",
    description: "Every vehicle undergoes a comprehensive multi-point inspection before listing. Detailed reports with photos provided."
  },
  {
    icon: Globe,
    title: "Worldwide Shipping",
    description: "Reliable RoRo and container shipping to ports in over 50 countries. Door-to-port and door-to-door options available."
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description: "FOB pricing with no hidden charges. Complete cost breakdowns including shipping, insurance, and documentation fees."
  },
  {
    icon: UserCheck,
    title: "Dedicated Advisor",
    description: "A personal export advisor is assigned to every client, guiding you from vehicle selection through to delivery."
  }
];

export default function HomePage() {
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const featured = cars.filter((c) => c.featured).slice(0, 6);
  const recent = cars.slice(-4).reverse();

  return (
    <div className="home-page">
      <section className="hero" style={{ marginTop: 'var(--header-height)' }}>
        <div className="hero__slides">
          {heroImages.map((img, idx) => (
            <div
              key={idx}
              className={`hero__slide${idx === heroIndex ? ' hero__slide--active' : ''}`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
        </div>
        <div className="hero__overlay" />
        <div className="hero__content wrap">
          <h1 className="hero__title">For Those Who Love Import Cars.</h1>
          <p className="hero__subtitle">
            Japan's trusted vehicle exporter since 1995. Premium used cars
            sourced and shipped to over 50 countries worldwide.
          </p>
          <div className="hero__actions">
            <Link to="/stock" className="btn btn--cyan btn--lg">Browse Stock</Link>
            <Link to="/contact" className="btn btn--ghost btn--lg">Contact Us</Link>
          </div>
          <div className="hero__dots">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                className={`hero__dot${idx === heroIndex ? ' hero__dot--active' : ''}`}
                onClick={() => setHeroIndex(idx)}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <SearchBar />
      <StatsStrip />

      <section className="section section--white">
        <div className="wrap">
          <div className="section-header">
            <h2>Featured Vehicles</h2>
            <Link to="/stock" className="section-header__link">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid-3">
            {featured.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--light">
        <div className="wrap">
          <div className="home-why">
            <div className="home-why__image">
              <div className="home-why__image-ratio">
                <img
                  src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=600&fit=crop"
                  alt="Destino showroom"
                />
              </div>
            </div>
            <div className="home-why__content">
              <h2>Why Choose Destino</h2>
              <p className="home-why__text">
                With nearly three decades of experience in the Japanese automotive export industry,
                Destino has built a reputation for reliability, transparency, and personalized service.
                We combine deep market knowledge with rigorous quality standards to deliver the right
                vehicle to clients worldwide.
              </p>
              <div className="home-why__usps">
                {usps.map((usp, idx) => (
                  <div key={idx} className="home-why__usp">
                    <div className="home-why__usp-icon">
                      <usp.icon size={20} />
                    </div>
                    <div className="home-why__usp-content">
                      <h4 className="home-why__usp-title">{usp.title}</h4>
                      <p className="home-why__usp-desc">{usp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--white">
        <div className="wrap">
          <div className="text-center" style={{ marginBottom: 'var(--space-xl)' }}>
            <h2>How It Works</h2>
            <p style={{ maxWidth: 520, margin: '8px auto 0', color: '#777', fontWeight: 300 }}>
              From browsing to delivery, we handle every step of the export process with precision and care.
            </p>
          </div>
          <ProcessSteps />
        </div>
      </section>

      <section className="section section--light">
        <div className="wrap">
          <div className="section-header">
            <h2>Recently Added</h2>
            <Link to="/stock" className="section-header__link">
              Browse All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid-4">
            {recent.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--primary">
        <div className="wrap">
          <TestimonialSlider />
        </div>
      </section>

      <CTABanner />
    </div>
  );
}
