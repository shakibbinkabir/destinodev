import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { testimonials } from '../data/testimonials';
import './TestimonialSlider.css';

export default function TestimonialSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const t = testimonials[current];

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
        {testimonials.map((_, idx) => (
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
