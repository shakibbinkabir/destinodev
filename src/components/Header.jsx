import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Phone, Gavel, LogIn, Ship } from 'lucide-react';
import JapanClock from './JapanClock';
import ExchangeRate from './ExchangeRate';
import { company } from '../data/company';
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
            <img src="/logo-link.png" alt="DESTINO" className="header__logo-img" />
          </Link>

          <nav className={`header__nav${menuOpen ? ' header__nav--open' : ''}`}>
            <NavLink to="/" className="header__link" onClick={closeMenu} end>Home</NavLink>
            <NavLink to="/stock" className="header__link" onClick={closeMenu}>Stock List</NavLink>
            <a href="https://autobidjp.com/login" className="header__link header__link--auction" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
              <Gavel size={13} />
              Live Auction
            </a>
            <NavLink to="/about" className="header__link" onClick={closeMenu}>About</NavLink>
            <NavLink to="/delivered" className="header__link" onClick={closeMenu}>Happy Customers</NavLink>
            <NavLink to="/shipping" className="header__link" onClick={closeMenu}>
              <Ship size={13} />
              Shipping
            </NavLink>
            <NavLink to="/contact" className="header__link" onClick={closeMenu}>Contact</NavLink>
          </nav>

          <div className="header__actions">
            <a href="https://app.destinoexport.com/login.php" className="header__login" target="_blank" rel="noopener noreferrer">
              <LogIn size={14} />
              Login
            </a>
            <a href={company.social.whatsapp} className="header__cta btn btn--cyan" target="_blank" rel="noopener noreferrer">Get a Quote</a>
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
