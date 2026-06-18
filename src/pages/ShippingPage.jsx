import { Download, FileText, ExternalLink, Newspaper, Ship } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import CTABanner from '../components/CTABanner';
import Loading from '../components/Loading';
import { useApi } from '../hooks/useApi';
import { getPage, getShippingSchedule } from '../api/site';
import { apiBaseUrl } from '../api/client';
import './ShippingPage.css';

const SHIPPING_PDF_URL = `${apiBaseUrl()}/shipping-pdf`;
const SCHEDULE_SOURCE_URL =
  'https://planetcars.jp/index.php/en/shipping-schedule-en/roro-vessel';

export default function ShippingPage() {
  // Page body is a marketing intro; falls back gracefully if the slug
  // isn't seeded yet.
  const pageQuery = useApi(
    (signal) => getPage('shipping', { signal }).catch(() => null),
    [],
  );

  // RoRo schedule directory — live-scraped + cached by the backend.
  const scheduleQuery = useApi(
    (signal) => getShippingSchedule({ signal }),
    [],
  );

  const body = pageQuery.data?.body;
  // Only surface the PDF download when one has actually been uploaded;
  // otherwise the endpoint 404s and the button is dead.
  const hasPdf = !!pageQuery.data?.extras?.shipping_pdf_path;

  const regions = scheduleQuery.data?.regions || [];
  const stale = scheduleQuery.data?.stale;

  return (
    <div className="shipping-page">
      <PageTitle
        title="Shipping Information"
        breadcrumbs={[{ label: 'Shipping Information' }]}
      />

      <section className="section section--white">
        <div className="wrap">
          <div className="shipping-page__header">
            <h2>{pageQuery.data?.title || 'Shipping Guide & Rates'}</h2>
            <p className="shipping-page__subtitle">
              {pageQuery.loading ? (
                <Loading inline label="Loading…" />
              ) : (
                body ||
                'RoRo (Roll-on/Roll-off) vessel schedules to ports worldwide, grouped by destination. Select a carrier to view its latest sailing schedule.'
              )}
            </p>
            {hasPdf && (
              <a
                href={SHIPPING_PDF_URL}
                download="Destino-Shipping-Information.pdf"
                className="btn btn--cyan btn--lg shipping-page__download-btn"
              >
                <Download size={16} />
                Download Shipping PDF
              </a>
            )}
          </div>

          <div className="shipping-page__schedule">
            <div className="shipping-page__schedule-head">
              <h3>
                <Ship size={20} />
                RoRo Shipping Schedules by Destination
              </h3>
              {stale && (
                <span className="shipping-page__stale" title="Showing the last successfully retrieved schedule.">
                  Schedule may be out of date
                </span>
              )}
            </div>

            {scheduleQuery.loading ? (
              <Loading label="Loading shipping schedules…" />
            ) : scheduleQuery.error || regions.length === 0 ? (
              <div className="shipping-page__fallback">
                <FileText size={48} />
                <p>The live shipping schedule is unavailable right now.</p>
                <a
                  href={SCHEDULE_SOURCE_URL}
                  className="btn btn--primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={16} />
                  View RoRo schedules
                </a>
              </div>
            ) : (
              <div className="shipping-page__regions">
                {regions.map((region) => (
                  <div className="shipping-page__region" key={region.region}>
                    <h4 className="shipping-page__region-name">{region.region}</h4>
                    <ul className="shipping-page__carriers">
                      {region.carriers.map((carrier, i) => (
                        <li
                          className="shipping-page__carrier"
                          key={`${region.region}-${carrier.name}-${i}`}
                        >
                          <span className="shipping-page__carrier-name">
                            {carrier.name}
                          </span>
                          <span className="shipping-page__carrier-links">
                            {carrier.schedule_url ? (
                              <a
                                href={carrier.schedule_url}
                                className="shipping-page__pill"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink size={13} />
                                Schedule
                              </a>
                            ) : (
                              <span className="shipping-page__pill shipping-page__pill--muted">
                                No schedule
                              </span>
                            )}
                            {carrier.news_url && (
                              <a
                                href={carrier.news_url}
                                className="shipping-page__pill shipping-page__pill--ghost"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Newspaper size={13} />
                                News
                              </a>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="shipping-page__links">
            <h3>Useful Shipping Resources</h3>
            <div className="shipping-page__links-grid">
              <a
                href="https://www.searates.com/services/distances-time/"
                className="shipping-page__link-card"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={16} />
                <div>
                  <strong>SeaRates</strong>
                  <span>Check shipping distances and transit times</span>
                </div>
              </a>
              <a
                href="https://www.freightos.com/"
                className="shipping-page__link-card"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={16} />
                <div>
                  <strong>Freightos</strong>
                  <span>Compare international freight rates</span>
                </div>
              </a>
              <a
                href="https://www.shippio.io/"
                className="shipping-page__link-card"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={16} />
                <div>
                  <strong>Shippio</strong>
                  <span>Japan-based freight forwarding & tracking</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <CTABanner />
    </div>
  );
}
