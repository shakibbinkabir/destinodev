import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import './PageTitle.css';

export default function PageTitle({ title, breadcrumbs = [] }) {
  return (
    <section className="page-title">
      <div className="page-title__overlay" />
      <div className="page-title__content wrap">
        <h1 className="page-title__heading">{title}</h1>
        {breadcrumbs.length > 0 && (
          <nav className="page-title__breadcrumb">
            <Link to="/" className="page-title__crumb">Home</Link>
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="page-title__crumb-separator">
                <ChevronRight size={12} />
                {crumb.to ? (
                  <Link to={crumb.to} className="page-title__crumb">{crumb.label}</Link>
                ) : (
                  <span className="page-title__crumb page-title__crumb--active">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}
