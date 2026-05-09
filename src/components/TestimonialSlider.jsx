import { useCallback, useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { listTestimonials } from '../api/testimonials';
import Loading from './Loading';
import ErrorState from './ErrorState';
import './TestimonialSlider.css';

export default function TestimonialSlider({ featuredOnly = true }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      let rows = await listTestimonials({ featured: featuredOnly }, { signal });
      if (featuredOnly && rows.length === 0) {
        rows = await listTestimonials({}, { signal });
      }
      setItems(rows);
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [featuredOnly]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  useEffect(() => {
    if (items.length <= 1) return undefined;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (loading) return <Loading label="Loading testimonials…" />;
  if (error) return <ErrorState onRetry={() => load()} />;
  if (items.length === 0) return null;

  const t = items[Math.min(current, items.length - 1)];

  return (
    <div className="testimonial-slider">
      <div className="testimonial-slider__stars">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={16}
            fill={i < t.stars ? '#f5c518' : 'none'}
            stroke={i < t.stars ? '#f5c518' : 'rgba(255,255,255,0.3)'}
          />
        ))}
      </div>
      <blockquote className="testimonial-slider__quote">"{t.text}"</blockquote>
      <p className="testimonial-slider__name">{t.name}</p>
      <p className="testimonial-slider__country">{t.country}</p>

      <div className="testimonial-slider__dots">
        {items.map((_, idx) => (
          <button
            key={idx}
            className={`testimonial-slider__dot${idx === current ? ' testimonial-slider__dot--active' : ''}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Testimonial ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
