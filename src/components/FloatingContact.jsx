import { useState, useEffect } from 'react';
import { MessageCircle, Phone, Mail, X } from 'lucide-react';
import { useSettings, get } from '../hooks/useSettings';
import './FloatingContact.css';

export default function FloatingContact() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { settings } = useSettings();

  const whatsapp = get(settings, 'company.whatsapp_url', 'https://wa.me/81459496777');
  const phone = get(settings, 'company.phone', '+81-45-949-6777');
  const email = get(settings, 'company.email', 'export@destino.jp');

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
          <a href={whatsapp} className="floating-contact__item floating-contact__item--whatsapp">
            <MessageCircle size={18} />
            <span>WhatsApp</span>
          </a>
          <a href={`tel:${phone}`} className="floating-contact__item floating-contact__item--phone">
            <Phone size={18} />
            <span>Call Us</span>
          </a>
          <a href={`mailto:${email}`} className="floating-contact__item floating-contact__item--email">
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
