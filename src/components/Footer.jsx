import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Youtube, Instagram, Facebook } from 'lucide-react';
import { company } from '../data/company';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__main wrap">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <span className="footer__logo-icon">D</span>
            <span className="footer__logo-text">DESTINO</span>
          </Link>
          <p className="footer__tagline">{company.tagline}</p>
          <p className="footer__desc">
            Japanese used and premium vehicle exporter since {company.established}.
            Serving clients in {company.countriesServed} countries worldwide from our
            headquarters in Yokohama, Japan.
          </p>
          <div className="footer__social">
            <a href={company.social.youtube} className="footer__social-link" aria-label="YouTube">
              <Youtube size={16} />
            </a>
            <a href={company.social.instagram} className="footer__social-link" aria-label="Instagram">
              <Instagram size={16} />
            </a>
            <a href={company.social.facebook} className="footer__social-link" aria-label="Facebook">
              <Facebook size={16} />
            </a>
          </div>
        </div>

        <div className="footer__links">
          <h4 className="footer__heading">Quick Links</h4>
          <Link to="/" className="footer__link">Home</Link>
          <Link to="/stock" className="footer__link">Stock List</Link>
          <Link to="/about" className="footer__link">About Us</Link>
          <Link to="/delivered" className="footer__link">Delivered Cars</Link>
          <Link to="/contact" className="footer__link">Contact</Link>
        </div>

        <div className="footer__links">
          <h4 className="footer__heading">Vehicle Types</h4>
          <Link to="/stock?bodyType=SUV" className="footer__link">SUVs</Link>
          <Link to="/stock?bodyType=Sedan" className="footer__link">Sedans</Link>
          <Link to="/stock?bodyType=Pickup" className="footer__link">Pickups</Link>
          <Link to="/stock?bodyType=Coupe" className="footer__link">Coupes</Link>
          <Link to="/stock?bodyType=Van" className="footer__link">Vans</Link>
        </div>

        <div className="footer__contact">
          <h4 className="footer__heading">Contact Us</h4>
          <div className="footer__contact-item">
            <MapPin size={14} />
            <span>{company.address.full}</span>
          </div>
          <div className="footer__contact-item">
            <Phone size={14} />
            <a href={`tel:${company.phone}`}>{company.phone}</a>
          </div>
          <div className="footer__contact-item">
            <Mail size={14} />
            <a href={`mailto:${company.email}`}>{company.email}</a>
          </div>
          <div className="footer__contact-item">
            <Clock size={14} />
            <span>{company.hours.weekday.days}: {company.hours.weekday.time}</span>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="wrap footer__bottom-inner">
          <p>&copy; {new Date().getFullYear()} {company.name}. All rights reserved.</p>
          <p>Member of JUMVEA (Japan Used Motor Vehicle Exporters Association)</p>
        </div>
      </div>
    </footer>
  );
}
