import './Partners.css';

const partners = [
  { name: 'Caterham', logo: '/logo-link.png', url: 'https://destino.jp' },
  { name: 'Lotus Cars', logo: '/logo-link.png', url: 'https://destino.jp' },
  { name: 'Morgan Motor', logo: '/logo-link.png', url: 'https://destino.jp' },
  { name: 'Yokohama Tires', logo: '/logo-link.png', url: '#' },
  { name: 'Caterpillar', logo: '/logo-link.png', url: '#' },
  { name: 'Fekema', logo: '/logo-link.png', url: '#' },
  { name: 'JUMVEA', logo: '/logo-link.png', url: '#' },
  { name: 'USS Auto Auction', logo: '/logo-link.png', url: '#' },
  { name: 'AUCNET', logo: '/logo-link.png', url: '#' },
  { name: 'MK Seiko', logo: '/logo-link.png', url: 'https://destino-v.com' },
];

export default function Partners() {
  return (
    <div className="partners">
      <div className="partners__header">
        <h2 className="partners__title">Our Sales Partners</h2>
        <p className="partners__subtitle">
          Partnered with leading automotive brands and industry organisations in Japan and worldwide.
        </p>
      </div>
      <div className="partners__logos">
        {partners.map((partner) => (
          <a
            key={partner.name}
            href={partner.url}
            className="partners__item"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={partner.logo} alt={partner.name} loading="lazy" />
            <span className="partners__name">{partner.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
