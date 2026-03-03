import { useState, useEffect } from 'react';
import { MessageCircle, Phone, Mail, X } from 'lucide-react';
import { company } from '../data/company';
import './FloatingContact.css';

export default function FloatingContact() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="floating-contact">
      {expanded && (
        <div className="floating-contact__panel">
          <a href={company.social.whatsapp} className="floating-contact__item floating-contact__item--whatsapp">
            <MessageCircle size={18} />
            <span>WhatsApp</span>
          </a>
          <a href={`tel:${company.phone}`} className="floating-contact__item floating-contact__item--phone">
            <Phone size={18} />
            <span>Call Us</span>
          </a>
          <a href={`mailto:${company.email}`} className="floating-contact__item floating-contact__item--email">
            <Mail size={18} />
            <span>Email</span>
          </a>
        </div>
      )}
      <button
        className="floating-contact__trigger"
        onClick={() => setExpanded(!expanded)}
        aria-label="Contact options"
      >
        {expanded ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
