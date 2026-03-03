import {
  Search, ShoppingCart, ClipboardCheck, Ship, FileText, Headphones,
  MapPin, Phone, Clock
} from 'lucide-react';
import PageTitle from '../components/PageTitle';
import ProcessSteps from '../components/ProcessSteps';
import CTABanner from '../components/CTABanner';
import { company } from '../data/company';
import './AboutPage.css';

const services = [
  {
    icon: Search,
    title: "Vehicle Sourcing & Export",
    description: "Access to thousands of vehicles through Japanese auctions and dealer networks. We find the right vehicle at the right price for your market."
  },
  {
    icon: ShoppingCart,
    title: "Auction Purchasing",
    description: "Experienced bidding team attending major Japanese auto auctions weekly. Real-time bidding with transparent fee structure."
  },
  {
    icon: ClipboardCheck,
    title: "Inspection & Quality Assurance",
    description: "Multi-point inspection for every vehicle before purchase. Detailed condition reports with high-resolution photographs provided to clients."
  },
  {
    icon: Ship,
    title: "Shipping & Logistics",
    description: "RoRo and container shipping to ports worldwide. We coordinate with reliable carriers and provide real-time shipment tracking."
  },
  {
    icon: FileText,
    title: "Documentation & Customs Support",
    description: "Complete export documentation including certificates of title, export certificates, and Bill of Lading. Customs clearance assistance available."
  },
  {
    icon: Headphones,
    title: "After-Sales Support",
    description: "Continued support after delivery. We assist with any questions regarding your vehicle and maintain long-term client relationships."
  }
];

export default function AboutPage() {
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
              <h2>About DESTINO</h2>
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
            </div>
          </div>
        </div>
      </section>

      <section className="section section--light">
        <div className="wrap">
          <div className="text-center" style={{ marginBottom: 'var(--space-xl)' }}>
            <h2>Our Services</h2>
          </div>
          <div className="about-page__services">
            {services.map((service, idx) => (
              <div key={idx} className="about-page__service">
                <div className="about-page__service-icon">
                  <service.icon size={22} />
                </div>
                <h3 className="about-page__service-title">{service.title}</h3>
                <p className="about-page__service-desc">{service.description}</p>
              </div>
            ))}
          </div>
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
              <tr><td>Company Name</td><td>{company.name}</td></tr>
              <tr><td>Representative</td><td>{company.companyInfo.representative}</td></tr>
              <tr><td>Established</td><td>{company.established}</td></tr>
              <tr><td>Business Activities</td><td>{company.companyInfo.businessActivities}</td></tr>
              <tr><td>Head Office</td><td>{company.address.full}</td></tr>
              <tr><td>Phone</td><td>{company.phone}</td></tr>
              <tr><td>Fax</td><td>{company.fax}</td></tr>
              <tr><td>Email</td><td>{company.email}</td></tr>
              <tr><td>Memberships</td><td>{company.companyInfo.memberships}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="section section--white">
        <div className="wrap">
          <h2 style={{ marginBottom: 'var(--space-lg)' }}>Our Locations</h2>
          <div className="about-page__locations">
            {company.locations.map((loc, idx) => (
              <div key={idx} className="about-page__location">
                <h3 className="about-page__location-name">{loc.name}</h3>
                <div className="about-page__location-detail">
                  <MapPin size={14} />
                  <span>{loc.address}</span>
                </div>
                <div className="about-page__location-detail">
                  <Phone size={14} />
                  <a href={`tel:${loc.phone}`}>{loc.phone}</a>
                </div>
                <div className="about-page__location-detail">
                  <Clock size={14} />
                  <span>{loc.hours}</span>
                </div>
                <div className="about-page__location-map">
                  <MapPin size={32} />
                  <span>Google Maps</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </div>
  );
}
