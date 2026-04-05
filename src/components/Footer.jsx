import { Link } from 'react-router-dom';
import { Youtube, Instagram, Facebook } from 'lucide-react';
import { company } from '../data/company';
import './Footer.css';

const groupCompanies = [
  {
    name: 'DESTINO Yokohama Showroom',
    description: 'Head office & vehicle showroom',
    url: 'https://destino.jp',
  },
  {
    name: 'Scuderia Destino Service Workshop',
    description: 'Certified maintenance & repair factory',
    url: 'https://destino.jp',
  },
  {
    name: 'Carrozzeria Destino',
    description: 'Sheet metal & painting factory',
    url: 'https://destino.jp',
  },
  {
    name: 'Car Washing EXP',
    description: 'MK Seiko car wash machine solutions',
    url: 'https://destino-v.com',
  },
  {
    name: 'Sagittario',
    description: 'Automotive parts & tuning',
    url: 'https://sagittario-corse.jp',
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__main wrap">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <img src="/logo-link.png" alt="DESTINO" className="footer__logo-img" />
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
          <Link to="/delivered" className="footer__link">Happy Customers</Link>
          <Link to="/shipping" className="footer__link">Shipping</Link>
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

        <div className="footer__map-col">
          <h4 className="footer__heading">Our Location</h4>
          <div className="footer__map-wrap">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3247.06!2d139.5555!3d35.5465!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z5qiq5rWc5biC6YO957-g5Yy6!5e0!3m2!1sja!2sjp!4v1700000000000"
              className="footer__map-iframe"
              title="DESTINO Yokohama Head Office"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      <div className="footer__group">
        <div className="wrap">
          <h4 className="footer__heading" style={{ marginBottom: 'var(--space-md)' }}>Group Companies</h4>
          <div className="footer__group-grid">
            {groupCompanies.map((gc) => (
              <a
                key={gc.name}
                href={gc.url}
                className="footer__group-card"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="footer__group-card-name">{gc.name}</span>
                <span className="footer__group-card-desc">{gc.description}</span>
              </a>
            ))}
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
