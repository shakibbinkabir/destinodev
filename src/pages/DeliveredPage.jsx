import { useState, useMemo } from 'react';
import { Calendar, MapPin, Package, Globe, TrendingUp } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import StatsStrip from '../components/StatsStrip';
import CTABanner from '../components/CTABanner';
import { deliveredCars } from '../data/company';
import './DeliveredPage.css';

const deliveryStats = [
  { icon: Package, value: String(12), label: "Total Deliveries" },
  { icon: Globe, value: "10", label: "Countries" },
  { icon: TrendingUp, value: "8", label: "Delivered This Year" },
];

export default function DeliveredPage() {
  const [yearFilter, setYearFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  const years = [...new Set(deliveredCars.map((d) => new Date(d.deliveryDate).getFullYear()))].sort((a, b) => b - a);
  const countries = [...new Set(deliveredCars.map((d) => d.destination))].sort();

  const filtered = useMemo(() => {
    let result = [...deliveredCars];

    if (yearFilter) {
      result = result.filter((d) => new Date(d.deliveryDate).getFullYear() === parseInt(yearFilter));
    }

    if (countryFilter) {
      result = result.filter((d) => d.destination === countryFilter);
    }

    return result;
  }, [yearFilter, countryFilter]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="delivered-page">
      <PageTitle
        title="Delivered Cars"
        breadcrumbs={[{ label: 'Delivered Cars' }]}
      />

      <div className="delivered-page__filters">
        <div className="wrap delivered-page__filters-inner">
          <div className="delivered-page__filter-group">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="delivered-page__select"
            >
              <option value="">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="delivered-page__select"
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <span className="delivered-page__count">{filtered.length} deliveries</span>
        </div>
      </div>

      <section className="section section--light">
        <div className="wrap">
          <div className="delivered-page__grid">
            {filtered.map((del) => (
              <div key={del.id} className="delivered-card">
                <div className="delivered-card__image-wrap">
                  <div className="delivered-card__image-ratio">
                    <img src={del.image} alt={`${del.year} ${del.make} ${del.model}`} loading="lazy" />
                  </div>
                </div>
                <div className="delivered-card__body">
                  <h3 className="delivered-card__title">{del.make} {del.model}</h3>
                  <span className="delivered-card__year">{del.year}</span>

                  <div className="delivered-card__meta">
                    <span className="delivered-card__meta-item">
                      <Calendar size={12} />
                      {formatDate(del.deliveryDate)}
                    </span>
                    <span className="delivered-card__meta-item">
                      <MapPin size={12} />
                      {del.destination}
                    </span>
                  </div>

                  {del.testimonial && (
                    <p className="delivered-card__testimonial">"{del.testimonial}"</p>
                  )}

                  {del.customerName && (
                    <span className="delivered-card__customer">— {del.customerName}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="delivered-page__empty">
              <p>No deliveries match your current filters.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section section--white">
        <div className="wrap">
          <StatsStrip stats={deliveryStats} />
        </div>
      </section>

      <CTABanner />
    </div>
  );
}
