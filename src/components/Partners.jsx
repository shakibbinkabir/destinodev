import { useApi } from '../hooks/useApi';
import { getPartners } from '../api/site';
import Loading from './Loading';
import ErrorState from './ErrorState';
import './Partners.css';

export default function Partners() {
  const { data, loading, error, refetch } = useApi(
    (signal) => getPartners({ signal }),
    [],
  );

  const partners = data || [];

  return (
    <div className="partners">
      <div className="partners__header">
        <h2 className="partners__title">Our Sales Partners</h2>
        <p className="partners__subtitle">
          Partnered with leading automotive brands and industry organisations in Japan and worldwide.
        </p>
      </div>
      {loading ? (
        <Loading label="Loading partners…" />
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div className="partners__logos">
          {partners.map((partner) => (
            <a
              key={partner.id}
              href={partner.url || '#'}
              className="partners__item"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="partners__thumb">
                <img src={partner.logo || '/logo-link.png'} alt={partner.name} loading="lazy" />
              </div>
              <div className="partners__caption">
                <span className="partners__name">{partner.name}</span>
                <span className="partners__arrow" aria-hidden="true">›</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
