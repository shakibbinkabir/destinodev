import { MapPin, Phone, Clock } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import ProcessSteps from '../components/ProcessSteps';
import CTABanner from '../components/CTABanner';
import Partners from '../components/Partners';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import { resolveIcon } from '../components/iconMap';
import { useApi } from '../hooks/useApi';
import { useSettings, get } from '../hooks/useSettings';
import { getServices, getPage } from '../api/site';
import './AboutPage.css';

const FALLBACK_SERVICE_ICONS = ['Search', 'ShoppingCart', 'ClipboardCheck', 'Ship', 'FileText', 'Headphones'];

export default function AboutPage() {
  const { settings } = useSettings();
  const servicesQuery = useApi((signal) => getServices({ signal }), []);
  const pageQuery = useApi((signal) => getPage('about', { signal }).catch(() => null), []);

  const companyName = get(settings, 'company.name', 'DESTINO Corporation');
  const representative = get(settings, 'company.representative', 'Takeshi Yamamoto');
  const address = get(settings, 'company.address', '5-20-25 Chigasaki-Minami, Tsuzuki-ku, Yokohama, Kanagawa 224-0037, Japan');
  const phone = get(settings, 'company.phone', '+81-45-949-6777');
  const fax = get(settings, 'company.fax', '+81-45-482-6444');
  const email = get(settings, 'company.email', 'export@destino.jp');
  const businessHours = get(settings, 'company.business_hours', 'Tue–Sat 10:00–19:00 / Sun & Holidays 10:00–18:00 / Monday Closed');
  const memberships = get(settings, 'company.jumvea_member', true)
    ? 'Japan Used Motor Vehicle Exporters Association (JUMVEA)'
    : '—';

  const services = servicesQuery.data || [];

  return (
    <div className="about-page">
      <PageTitle
        title="About DESTINO"
        breadcrumbs={[{ label: 'About' }]}
      />

      <section className="section section--white">
        <div className="wrap">
          <div className="about-page__story">
            <div className="about-page__story-image">
              <div className="about-page__story-ratio">
                <img
                  src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=600&fit=crop"
                  alt="Destino showroom"
                />
              </div>
            </div>
            <div className="about-page__story-content">
              <h2>{pageQuery.data?.title || 'About DESTINO'}</h2>
              {pageQuery.data?.body ? (
                <div style={{ whiteSpace: 'pre-line' }}>{pageQuery.data.body}</div>
              ) : (
                <>
                  <p>
                    Founded in 1995 in Yokohama, Japan, DESTINO Corporation has grown from a small
                    local operation to one of Japan's respected vehicle export companies. For nearly
                    three decades, we have been connecting buyers worldwide with quality Japanese vehicles.
                  </p>
                  <p>
                    Our mission is straightforward: to provide reliable, high-quality vehicles to
                    international clients with complete transparency in pricing, condition, and process.
                    We believe the best business relationships are built on trust, consistent communication,
                    and delivering exactly what we promise.
                  </p>
                  <p>
                    Operating from our headquarters in Yokohama, we have access to Japan's largest
                    vehicle auction networks and maintain strong relationships with dealers across the country.
                    This network allows us to source virtually any make and model our clients require.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section section--light">
        <div className="wrap">
          <div className="text-center" style={{ marginBottom: 'var(--space-xl)' }}>
            <h2>Our Services</h2>
          </div>
          {servicesQuery.loading ? (
            <Loading label="Loading services…" />
          ) : servicesQuery.error ? (
            <ErrorState onRetry={servicesQuery.refetch} />
          ) : (
            <div className="about-page__services">
              {services.map((service, idx) => {
                const Icon = resolveIcon(service.icon, FALLBACK_SERVICE_ICONS[idx % FALLBACK_SERVICE_ICONS.length]);
                return (
                  <div key={service.id} className="about-page__service">
                    <div className="about-page__service-icon">
                      <Icon size={22} />
                    </div>
                    <h3 className="about-page__service-title">{service.title}</h3>
                    <p className="about-page__service-desc">{service.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="section section--white">
        <div className="wrap">
          <div className="text-center" style={{ marginBottom: 'var(--space-xl)' }}>
            <h2>How It Works</h2>
            <p style={{ maxWidth: 520, margin: '8px auto 0', color: '#777', fontWeight: 300 }}>
              From browsing to delivery, we handle every step of the export process.
            </p>
          </div>
          <ProcessSteps />
        </div>
      </section>

      <section className="section section--light">
        <div className="wrap">
          <h2 style={{ marginBottom: 'var(--space-lg)' }}>Company Information</h2>
          <table className="about-page__table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Company Name</td><td>{companyName}</td></tr>
              <tr><td>Representative</td><td>{representative}</td></tr>
              <tr><td>Established</td><td>1995</td></tr>
              <tr><td>Business Activities</td><td>Export of used and new vehicles, vehicle sourcing from Japanese auctions, inspection and quality assurance, international shipping and logistics, customs documentation support</td></tr>
              <tr><td>Head Office</td><td>{address}</td></tr>
              <tr><td>Phone</td><td>{phone}</td></tr>
              <tr><td>Fax</td><td>{fax}</td></tr>
              <tr><td>Email</td><td>{email}</td></tr>
              <tr><td>Memberships</td><td>{memberships}</td></tr>
              <tr><td>Group Company</td><td><a href="https://destino-v.com" target="_blank" rel="noopener noreferrer">Destino Pte Ltd</a> — Car Wash Solutions (Singapore)</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="section section--white">
        <div className="wrap">
          <h2 style={{ marginBottom: 'var(--space-lg)' }}>Our Locations</h2>
          <div className="about-page__locations">
            <div className="about-page__location">
              <h3 className="about-page__location-name">Yokohama Head Office &amp; Showroom</h3>
              <div className="about-page__location-detail">
                <MapPin size={14} />
                <span>{address}</span>
              </div>
              <div className="about-page__location-detail">
                <Phone size={14} />
                <a href={`tel:${phone}`}>{phone}</a>
              </div>
              <div className="about-page__location-detail">
                <Clock size={14} />
                <span>{businessHours}</span>
              </div>
              <div className="about-page__location-map">
                <MapPin size={32} />
                <span>Google Maps</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--light">
        <div className="wrap">
          <Partners />
        </div>
      </section>

      <CTABanner />
    </div>
  );
}
