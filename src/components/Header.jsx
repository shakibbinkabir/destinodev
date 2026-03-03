import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Phone, Gavel } from 'lucide-react';
import JapanClock from './JapanClock';
import ExchangeRate from './ExchangeRate';
import './Header.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div className="header-topbar">
        <div className="header-topbar__inner wrap">
          <div className="header-topbar__left">
            <JapanClock />
            <ExchangeRate variant="compact" />
          </div>
          <div className="header-topbar__right">
            <a href="tel:+81-45-949-6777" className="header-topbar__phone">
              <Phone size={12} />
              +81-45-949-6777
            </a>
          </div>
        </div>
      </div>
      <header className={`header${scrolled ? ' header--scrolled' : ''}`}>
        <div className="header__inner wrap">
          <Link to="/" className="header__logo" onClick={closeMenu}>
            <span className="header__logo-icon">D</span>
            <span className="header__logo-text">DESTINO</span>
          </Link>

          <nav className={`header__nav${menuOpen ? ' header__nav--open' : ''}`}>
            <NavLink to="/" className="header__link" onClick={closeMenu} end>Home</NavLink>
            <NavLink to="/stock" className="header__link" onClick={closeMenu}>Stock List</NavLink>
            <NavLink to="/auction" className="header__link header__link--auction" onClick={closeMenu}>
              <Gavel size={13} />
              Live Auction
            </NavLink>
            <NavLink to="/about" className="header__link" onClick={closeMenu}>About</NavLink>
            <NavLink to="/delivered" className="header__link" onClick={closeMenu}>Delivered</NavLink>
            <NavLink to="/contact" className="header__link" onClick={closeMenu}>Contact</NavLink>
          </nav>

          <div className="header__actions">
            <Link to="/contact" className="header__cta btn btn--cyan">Get a Quote</Link>
          </div>

          <button
            className="header__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && <div className="header__overlay" onClick={closeMenu} />}
      </header>
    </>
  );
}
