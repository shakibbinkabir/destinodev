import { useState } from 'react';
import { Download, FileText, ExternalLink } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import CTABanner from '../components/CTABanner';
import Loading from '../components/Loading';
import { useApi } from '../hooks/useApi';
import { getPage } from '../api/site';
import { apiBaseUrl } from '../api/client';
import './ShippingPage.css';

const SHIPPING_PDF_URL = `${apiBaseUrl()}/shipping-pdf`;

export default function ShippingPage() {
  const [pdfError, setPdfError] = useState(false);

  // Page body is a marketing intro; falls back gracefully if the slug
  // isn't seeded yet.
  const pageQuery = useApi(
    (signal) => getPage('shipping', { signal }).catch(() => null),
    [],
  );

  const body = pageQuery.data?.body;

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
                body || 'Download or view our shipping information document for details on rates, transit times, and delivery options to your country.'
              )}
            </p>
            <a
              href={SHIPPING_PDF_URL}
              download="Destino-Shipping-Information.pdf"
              className="btn btn--cyan btn--lg shipping-page__download-btn"
            >
              <Download size={16} />
              Download Shipping PDF
            </a>
          </div>

          <div className="shipping-page__viewer">
            {!pdfError ? (
              <iframe
                src={SHIPPING_PDF_URL}
                className="shipping-page__iframe"
                title="Shipping Information PDF"
                onError={() => setPdfError(true)}
              />
            ) : (
              <div className="shipping-page__fallback">
                <FileText size={48} />
                <p>Unable to display the PDF in the browser.</p>
                <a
                  href={SHIPPING_PDF_URL}
                  download="Destino-Shipping-Information.pdf"
                  className="btn btn--primary"
                >
                  <Download size={16} />
                  Download PDF
                </a>
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
