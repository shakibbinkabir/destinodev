import './Partners.css';

const partners = [
  { name: 'AQCL Global Logistics', logo: '/logo-link.png' },
  { name: 'JUMVEA', logo: '/logo-link.png' },
  { name: 'ARAI Auto Auction Group', logo: '/logo-link.png' },
  { name: 'USS Used Car System Solutions', logo: '/logo-link.png' },
  { name: 'ORIX', logo: '/logo-link.png' },
  { name: 'AUCNET', logo: '/logo-link.png' },
];

export default function Partners() {
  return (
    <div className="partners">
      <div className="partners__header">
        <h2 className="partners__title">Our Sales Partners</h2>
        <p className="partners__subtitle">
          We are partnered with major companies related to the vehicle export business in Japan.
        </p>
      </div>
      <div className="partners__logos">
        {partners.map((partner) => (
          <div key={partner.name} className="partners__item">
            <img src={partner.logo} alt={partner.name} loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}
