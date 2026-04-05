import { useState, useMemo } from 'react';
import { Calendar, MapPin, Package, Globe, TrendingUp, PenLine, Star, Send, X } from 'lucide-react';
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
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', country: '', vehicle: '', rating: 5, review: '' });

  const handleReviewChange = (e) => {
    setReviewForm({ ...reviewForm, [e.target.name]: e.target.value });
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    setReviewSubmitted(true);
  };

  const closeReviewForm = () => {
    setShowReviewForm(false);
    setReviewSubmitted(false);
    setReviewForm({ name: '', country: '', vehicle: '', rating: 5, review: '' });
  };

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
        title="Happy Customers"
        breadcrumbs={[{ label: 'Happy Customers' }]}
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

      <section className="section section--light">
        <div className="wrap text-center">
          <h2 style={{ marginBottom: 'var(--space-sm)' }}>Purchased from Destino?</h2>
          <p style={{ color: '#777', fontWeight: 300, fontSize: 14, marginBottom: 'var(--space-lg)' }}>
            We'd love to hear about your experience. Share your review and help others make informed decisions.
          </p>
          <button
            className="btn btn--cyan btn--lg"
            onClick={() => setShowReviewForm(true)}
          >
            <PenLine size={16} />
            Write Your Review
          </button>
        </div>
      </section>

      {showReviewForm && (
        <div className="review-modal__overlay" onClick={closeReviewForm}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <button className="review-modal__close" onClick={closeReviewForm}>
              <X size={20} />
            </button>

            {reviewSubmitted ? (
              <div className="review-modal__success">
                <h3>Thank you for your review!</h3>
                <p>Your review has been submitted and will be published after approval by our team.</p>
                <button className="btn btn--primary" onClick={closeReviewForm}>Close</button>
              </div>
            ) : (
              <>
                <h3 className="review-modal__title">Write Your Review</h3>
                <p className="review-modal__subtitle">
                  Your review will be published after approval by our team.
                </p>
                <form className="review-modal__form" onSubmit={handleReviewSubmit}>
                  <div className="review-modal__row">
                    <div className="review-modal__field">
                      <label>Your Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={reviewForm.name}
                        onChange={handleReviewChange}
                        required
                      />
                    </div>
                    <div className="review-modal__field">
                      <label>Country *</label>
                      <input
                        type="text"
                        name="country"
                        value={reviewForm.country}
                        onChange={handleReviewChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="review-modal__field">
                    <label>Vehicle Purchased</label>
                    <input
                      type="text"
                      name="vehicle"
                      value={reviewForm.vehicle}
                      onChange={handleReviewChange}
                      placeholder="e.g. 2023 Toyota Land Cruiser"
                    />
                  </div>
                  <div className="review-modal__field">
                    <label>Rating *</label>
                    <div className="review-modal__stars">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          className={`review-modal__star${s <= reviewForm.rating ? ' review-modal__star--active' : ''}`}
                          onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                        >
                          <Star size={20} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="review-modal__field">
                    <label>Your Review *</label>
                    <textarea
                      name="review"
                      value={reviewForm.review}
                      onChange={handleReviewChange}
                      required
                      rows={4}
                      placeholder="Tell us about your experience..."
                    />
                  </div>
                  <button type="submit" className="btn btn--primary btn--full btn--lg">
                    <Send size={16} />
                    Submit Review
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <CTABanner />
    </div>
  );
}
