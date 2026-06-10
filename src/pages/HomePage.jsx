import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Globe, DollarSign, UserCheck, ArrowRight, Play } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import StatsStrip from '../components/StatsStrip';
import CarCard from '../components/CarCard';
import ProcessSteps from '../components/ProcessSteps';
import TestimonialSlider from '../components/TestimonialSlider';
import CTABanner from '../components/CTABanner';
import Partners from '../components/Partners';
import BrandGrid from '../components/BrandGrid';
import FacebookFeed from '../components/FacebookFeed';
import InstagramFeed from '../components/InstagramFeed';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import { useApi } from '../hooks/useApi';
import { useSettings, get } from '../hooks/useSettings';
import { listCars } from '../api/cars';
import { getHeroSlides, getYouTubeFeed } from '../api/site';
import './HomePage.css';

const FALLBACK_HERO_IMAGES = [
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

  const { settings } = useSettings();
  const channelId = get(settings, 'integrations.youtube_channel_id', 'UC9r_ugFs9RL4OkeEAwztQ7g');
  const channelUrl = `https://www.youtube.com/channel/${channelId}`;

  // Homepage social-section visibility (admin-controlled). YouTube defaults on;
  // Facebook/Instagram stay off until a URL is configured + the toggle is set.
  const youtubeEnabled = get(settings, 'homepage.youtube_enabled', true);
  const facebookEnabled = get(settings, 'homepage.facebook_enabled', false);
  const instagramEnabled = get(settings, 'homepage.instagram_enabled', false);
  const facebookUrl = get(settings, 'social.facebook', '');
  const instagramUrl = get(settings, 'social.instagram', '');

  const heroQuery = useApi((signal) => getHeroSlides({ signal }), []);
  const featuredQuery = useApi(
    (signal) => listCars({ featured: true, per_page: 6 }, { signal }),
    [],
  );
  const recentQuery = useApi(
    (signal) => listCars({ sort: 'latest', per_page: 4 }, { signal }),
    [],
  );
  const youtubeQuery = useApi((signal) => getYouTubeFeed({ signal }), []);

  const heroImages = (heroQuery.data && heroQuery.data.length > 0)
    ? heroQuery.data.map((s) => s.image).filter(Boolean)
    : FALLBACK_HERO_IMAGES;

  useEffect(() => {
    if (heroImages.length <= 1) return undefined;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const featured = featuredQuery.data?.data || [];
  const recent = recentQuery.data?.data || [];
  const videos = (youtubeQuery.data?.videos || []).slice(0, 3);

  return (
    <div className="home-page">
      <section className="hero" style={{ marginTop: 'var(--header-total)' }}>
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

      <StatsStrip />

      <section className="section section--white">
        <div className="wrap">
          <SearchBar />
          <div className="section-header">
            <h2>Featured Vehicles</h2>
            <Link to="/stock" className="section-header__link">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {featuredQuery.loading ? (
            <Loading label="Loading featured vehicles…" />
          ) : featuredQuery.error ? (
            <ErrorState onRetry={featuredQuery.refetch} />
          ) : (
            <div className="grid-3">
              {featured.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
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

      <section className="section section--white">
        <div className="wrap">
          <div className="text-center" style={{ marginBottom: 'var(--space-xl)' }}>
            <h2>Browse by Brand</h2>
            <p style={{ maxWidth: 520, margin: '8px auto 0', color: '#777', fontWeight: 300 }}>
              Explore our stock by manufacturer, grouped by country of origin.
            </p>
          </div>
          <BrandGrid showHeader={false} />
        </div>
      </section>

      <section className="section section--light">
        <div className="wrap">
          <Partners />
        </div>
      </section>

      <section className="section section--white">
        <div className="wrap">
          <div className="section-header">
            <h2>Recently Added</h2>
            <Link to="/stock" className="section-header__link">
              Browse All <ArrowRight size={14} />
            </Link>
          </div>
          {recentQuery.loading ? (
            <Loading label="Loading recent vehicles…" />
          ) : recentQuery.error ? (
            <ErrorState onRetry={recentQuery.refetch} />
          ) : (
            <div className="grid-4">
              {recent.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section section--primary">
        <div className="wrap">
          <TestimonialSlider />
        </div>
      </section>

      {youtubeEnabled && videos.length > 0 && (
        <section className="section section--light">
          <div className="wrap">
            <div className="section-header">
              <h2>From Our Channel</h2>
              <a
                href={channelUrl}
                className="section-header__link"
                target="_blank"
                rel="noopener noreferrer"
              >
                View All <ArrowRight size={14} />
              </a>
            </div>
            <div className="home-videos">
              {videos.map((video) => (
                <a
                  key={video.videoId}
                  href={`https://www.youtube.com/watch?v=${video.videoId}`}
                  className="home-video"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="home-video__thumb">
                    <img
                      src={video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                      alt={video.title}
                      loading="lazy"
                    />
                    <div className="home-video__play">
                      <Play size={24} />
                    </div>
                  </div>
                  <div className="home-video__info">
                    <h4 className="home-video__title">{video.title}</h4>
                    {video.views && (
                      <span className="home-video__views">
                        {Number(video.views).toLocaleString()} views
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {facebookEnabled && facebookUrl && (
        <section className="section section--white">
          <div className="wrap">
            <div className="text-center" style={{ marginBottom: 'var(--space-xl)' }}>
              <h2>Follow Us on Facebook</h2>
            </div>
            <FacebookFeed url={facebookUrl} />
          </div>
        </section>
      )}

      {instagramEnabled && instagramUrl && (
        <section className="section section--light">
          <div className="wrap">
            <div className="text-center" style={{ marginBottom: 'var(--space-xl)' }}>
              <h2>Follow Us on Instagram</h2>
            </div>
            <InstagramFeed url={instagramUrl} />
          </div>
        </section>
      )}

      <CTABanner />
    </div>
  );
}
