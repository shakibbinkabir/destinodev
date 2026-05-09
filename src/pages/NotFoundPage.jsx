import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <PageTitle title="Page Not Found" breadcrumbs={[{ label: '404' }]} />
      <section className="section section--white">
        <div className="wrap not-found-page__inner">
          <div className="not-found-page__code">404</div>
          <h2 className="not-found-page__title">We can't find that page</h2>
          <p className="not-found-page__lede">
            The page you were looking for may have moved, been removed, or never
            existed. Try one of the links below to continue browsing.
          </p>
          <div className="not-found-page__actions">
            <Link to="/" className="btn btn--primary btn--lg">
              <Home size={16} />
              Back to Home
            </Link>
            <Link to="/stock" className="btn btn--outline btn--lg">
              <Compass size={16} />
              Browse Stock
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
