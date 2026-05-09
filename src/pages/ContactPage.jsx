import { MapPin, Phone, Printer, Mail, MessageCircle, Clock, Youtube, Instagram, Facebook } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import InquiryForm from '../components/InquiryForm';
import CTABanner from '../components/CTABanner';
import { useApi } from '../hooks/useApi';
import { useSettings, get } from '../hooks/useSettings';
import { getPage } from '../api/site';
import './ContactPage.css';

function parseHours(text) {
  if (!text) return [];
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export default function ContactPage() {
  const { settings } = useSettings();
  // Body copy lives in page_contents but is optional — most of the contact
  // surface is settings-driven. Swallow 404 quietly.
  const pageQuery = useApi((signal) => getPage('contact', { signal }).catch(() => null), []);

  const address = get(settings, 'company.address', '');
  const phone = get(settings, 'company.phone', '+81-45-949-6777');
  const fax = get(settings, 'company.fax', '+81-45-482-6444');
  const email = get(settings, 'company.email', 'export@destino.jp');
  const whatsapp = get(settings, 'company.whatsapp_url', 'https://wa.me/81459496777');
  const businessHours = get(settings, 'company.business_hours', '');
  const youtube = get(settings, 'social.youtube', '#');
  const instagram = get(settings, 'social.instagram', '#');
  const facebook = get(settings, 'social.facebook', '#');

  const hourLines = parseHours(businessHours);

  return (
    <div className="contact-page">
      <PageTitle
        title="Contact Us"
        breadcrumbs={[{ label: 'Contact' }]}
      />

      <section className="section section--white">
        <div className="wrap">
          <div className="contact-page__layout">
            <div className="contact-page__form-side">
              <h2 style={{ marginBottom: 'var(--space-sm)' }}>Send Us an Inquiry</h2>
              <p style={{ color: '#777', fontWeight: 300, marginBottom: 'var(--space-lg)', fontSize: 14 }}>
                {pageQuery.data?.body
                  ? pageQuery.data.body
                  : 'Fill out the form below and our team will respond within 24 hours during business days.'}
              </p>
              <InquiryForm source="contact_page" />
            </div>

            <div className="contact-page__info-side">
              <h3 className="contact-page__info-heading">Contact Information</h3>

              <div className="contact-page__info-item">
                <MapPin size={16} />
                <div>
                  <strong>Address</strong>
                  <p>{address}</p>
                </div>
              </div>

              <div className="contact-page__info-item">
                <Phone size={16} />
                <div>
                  <strong>Phone</strong>
                  <p><a href={`tel:${phone}`}>{phone}</a></p>
                </div>
              </div>

              <div className="contact-page__info-item">
                <Printer size={16} />
                <div>
                  <strong>Fax</strong>
                  <p>{fax}</p>
                </div>
              </div>

              <div className="contact-page__info-item">
                <Mail size={16} />
                <div>
                  <strong>Email</strong>
                  <p><a href={`mailto:${email}`}>{email}</a></p>
                </div>
              </div>

              <a href={whatsapp} className="contact-page__whatsapp">
                <MessageCircle size={18} />
                Chat on WhatsApp
              </a>

              <div className="contact-page__hours">
                <h4 className="contact-page__hours-title">
                  <Clock size={14} />
                  Business Hours
                </h4>
                <table className="contact-page__hours-table">
                  <tbody>
                    {hourLines.length > 0 ? (
                      hourLines.map((line, idx) => (
                        <tr key={idx}>
                          <td colSpan={2}>{line}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={2}>—</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="contact-page__social">
                <span className="contact-page__social-label">Follow Us</span>
                <div className="contact-page__social-links">
                  <a href={youtube || '#'} className="contact-page__social-link" aria-label="YouTube">
                    <Youtube size={18} />
                  </a>
                  <a href={instagram || '#'} className="contact-page__social-link" aria-label="Instagram">
                    <Instagram size={18} />
                  </a>
                  <a href={facebook || '#'} className="contact-page__social-link" aria-label="Facebook">
                    <Facebook size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-page__map">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3247.06!2d139.5555!3d35.5465!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z5qiq5rWc5biC6YO957-g5Yy6!5e0!3m2!1sja!2sjp!4v1700000000000"
          className="contact-page__map-embed"
          title="DESTINO Yokohama Head Office"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>

      <CTABanner />
    </div>
  );
}
