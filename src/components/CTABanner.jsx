import { Link } from 'react-router-dom';
import { Search, MessageCircle } from 'lucide-react';
import './CTABanner.css';

export default function CTABanner() {
  return (
    <section className="cta-banner section">
      <div className="cta-banner__inner wrap">
        <div className="cta-banner__content">
          <h2 className="cta-banner__title">Can't find what you're looking for?</h2>
          <p className="cta-banner__text">
            We source vehicles directly from Japanese auctions on your behalf.
            Tell us what you need, and our team will find the perfect match.
          </p>
        </div>
        <div className="cta-banner__actions">
          <Link to="/contact" className="btn btn--cyan btn--lg">
            <MessageCircle size={16} />
            Contact Us
          </Link>
          <Link to="/stock" className="btn btn--outline btn--lg">
            <Search size={16} />
            Browse Stock
          </Link>
        </div>
      </div>
    </section>
  );
}
