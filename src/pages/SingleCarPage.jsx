import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight, Gauge, Settings, Fuel, Palette, Cog, Users,
  DoorOpen, Award, Car, Share2, MessageCircle, Facebook, Copy, Zap, Battery
} from 'lucide-react';
import ImageGallery from '../components/ImageGallery';
import CarCard from '../components/CarCard';
import InquiryForm from '../components/InquiryForm';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import { useApi } from '../hooks/useApi';
import { useSettings, get } from '../hooks/useSettings';
import { ApiError } from '../api/client';
import { getCar, getSimilarCars } from '../api/cars';
import './SingleCarPage.css';

const specIcons = {
  mileage: Gauge,
  transmission: Settings,
  fuel: Fuel,
  engineSize: Cog,
  bodyType: Car,
  color: Palette,
  driveType: Settings,
  seats: Users,
  doors: DoorOpen,
  condition: Award,
  batteryCapacity: Battery,
  motorOutput: Zap,
};

function getVehicleType(fuel) {
  if (fuel === 'Electric' || fuel === 'EV') return 'EV';
  if (fuel === 'Hybrid' || fuel === 'PHEV') return 'Hybrid';
  return 'Gasoline';
}

export default function SingleCarPage() {
  const { id } = useParams();
  const { settings } = useSettings();
  const whatsappBase = get(settings, 'company.whatsapp_url', 'https://wa.me/81459496777');

  const carQuery = useApi((signal) => getCar(id, { signal }), [id]);
  const similarQuery = useApi((signal) => getSimilarCars(id, { signal }), [id]);

  if (carQuery.loading) {
    return (
      <div className="single-car-page" style={{ marginTop: 'var(--header-total)' }}>
        <div className="wrap section">
          <Loading label="Loading vehicle…" />
        </div>
      </div>
    );
  }

  if (carQuery.error) {
    const isNotFound = carQuery.error instanceof ApiError && carQuery.error.status === 404;
    if (isNotFound) {
      return (
        <div className="single-car-page" style={{ marginTop: 'var(--header-total)' }}>
          <div className="wrap section text-center">
            <h2>Vehicle Not Found</h2>
            <p style={{ marginTop: 8, color: '#777', fontWeight: 300 }}>
              The vehicle you are looking for may no longer be available.
            </p>
            <Link to="/stock" className="btn btn--primary" style={{ marginTop: 20 }}>
              Browse Stock
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div className="single-car-page" style={{ marginTop: 'var(--header-total)' }}>
        <div className="wrap section">
          <ErrorState onRetry={carQuery.refetch} />
        </div>
      </div>
    );
  }

  const car = carQuery.data;
  if (!car) return null;

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);

  const fullTitle = `${car.year} ${car.make} ${car.model}`;
  const stockId = String(car.id);

  const vehicleType = getVehicleType(car.fuel);

  const baseSpecs = [
    { label: 'Mileage', value: `${(car.mileage || 0).toLocaleString()} km`, key: 'mileage' },
    { label: 'Transmission', value: car.transmission, key: 'transmission' },
  ];

  const powertrainSpecs = vehicleType === 'EV' ? [
    { label: 'Powertrain', value: 'Electric', key: 'fuel' },
    { label: 'Battery Capacity', value: car.batteryCapacity || 'N/A', key: 'batteryCapacity' },
    { label: 'Motor Output', value: car.motorOutput || 'N/A', key: 'motorOutput' },
  ] : vehicleType === 'Hybrid' ? [
    { label: 'Fuel Type', value: car.fuel, key: 'fuel' },
    { label: 'Engine Size', value: car.engineSize, key: 'engineSize' },
    { label: 'Motor Output', value: car.motorOutput || 'Hybrid Assist', key: 'motorOutput' },
  ] : [
    { label: 'Fuel Type', value: car.fuel, key: 'fuel' },
    { label: 'Engine Size', value: car.engineSize, key: 'engineSize' },
  ];

  const specs = [
    ...baseSpecs,
    ...powertrainSpecs,
    { label: 'Body Type', value: car.bodyType, key: 'bodyType' },
    { label: 'Color', value: car.color, key: 'color' },
    { label: 'Drive Type', value: car.driveType, key: 'driveType' },
    { label: 'Seats', value: car.seats, key: 'seats' },
    { label: 'Doors', value: car.doors, key: 'doors' },
    { label: 'Condition', value: car.condition, key: 'condition' },
  ];

  const similar = similarQuery.data || [];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const inquiryMessage = `Hi, I'm interested in: ${fullTitle} (Stock ID: ${stockId}). Please provide pricing and shipping details.`;
  const whatsappHref = `${whatsappBase}${whatsappBase.includes('?') ? '&' : '?'}text=${encodeURIComponent(inquiryMessage)}`;

  return (
    <div className="single-car-page">
      <div className="single-car-page__breadcrumb">
        <div className="wrap">
          <nav className="single-car-page__breadcrumb-nav">
            <Link to="/">Home</Link>
            <ChevronRight size={12} />
            <Link to="/stock">Stock List</Link>
            <ChevronRight size={12} />
            <Link to={`/stock?make=${car.make}`}>{car.make}</Link>
            <ChevronRight size={12} />
            <span>{car.model}</span>
          </nav>
        </div>
      </div>

      <div className="single-car-page__main wrap section">
        <div className="single-car-page__gallery">
          <ImageGallery images={car.images} alt={fullTitle} />
        </div>

        <div className="single-car-page__info">
          <div className="single-car-page__info-header">
            <h1 className="single-car-page__title">{car.make} {car.model}</h1>
            <div className="single-car-page__meta">
              <span className="single-car-page__year">{car.year}</span>
              {car.badge && (
                <span className={`single-car-page__badge single-car-page__badge--${car.badge.toLowerCase()}`}>
                  {car.badge}
                </span>
              )}
            </div>
          </div>

          <div className="single-car-page__price-block">
            <span className="single-car-page__fob">FOB Japan</span>
            <span className="single-car-page__price">{formatPrice(car.price)}</span>
          </div>

          <div className="single-car-page__badges-row">
            <span className={`single-car-page__source single-car-page__source--${car.source}`}>
              {car.source === 'api' ? 'API Stock' : 'In-House Stock'}
            </span>
            <span className={`single-car-page__vehicle-type single-car-page__vehicle-type--${vehicleType.toLowerCase()}`}>
              {vehicleType === 'EV' && <Zap size={11} />}
              {vehicleType}
            </span>
          </div>

          <div className="single-car-page__specs">
            {specs.map((spec) => {
              const Icon = specIcons[spec.key];
              return (
                <div key={spec.key} className="single-car-page__spec">
                  {Icon && <Icon size={14} className="single-car-page__spec-icon" />}
                  <span className="single-car-page__spec-label">{spec.label}</span>
                  <span className="single-car-page__spec-value">{spec.value}</span>
                </div>
              );
            })}
          </div>

          <a
            href={whatsappHref}
            className="single-car-page__inquire btn btn--cyan btn--full btn--lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={16} />
            Inquire via WhatsApp
          </a>

          <div className="single-car-page__share">
            <span className="single-car-page__share-label">Share:</span>
            <a href="#" className="single-car-page__share-btn">
              <MessageCircle size={16} />
              WhatsApp
            </a>
            <a href="#" className="single-car-page__share-btn">
              <Facebook size={16} />
              Facebook
            </a>
            <button className="single-car-page__share-btn" onClick={handleCopyLink}>
              <Copy size={16} />
              Copy Link
            </button>
          </div>
        </div>
      </div>

      <section className="single-car-page__full-specs section--light section">
        <div className="wrap">
          <h2 style={{ marginBottom: 'var(--space-lg)' }}>Full Specifications</h2>
          <table className="single-car-page__table">
            <thead>
              <tr>
                <th>Specification</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Make</td><td>{car.make}</td></tr>
              <tr><td>Model</td><td>{car.model}</td></tr>
              <tr><td>Year</td><td>{car.year}</td></tr>
              <tr><td>Price (FOB)</td><td>{formatPrice(car.price)}</td></tr>
              {specs.map((spec) => (
                <tr key={spec.key}><td>{spec.label}</td><td>{spec.value}</td></tr>
              ))}
              <tr><td>Stock ID</td><td>{stockId}</td></tr>
              <tr><td>Source</td><td>{car.source === 'api' ? 'API Stock' : 'In-House Stock'}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="section section--light">
        <div className="wrap">
          <h2 style={{ marginBottom: 'var(--space-lg)' }}>Quick Inquiry</h2>
          <div style={{ maxWidth: 700 }}>
            <InquiryForm carReference={fullTitle} carId={car.id} source="single_car" />
          </div>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="section section--white">
          <div className="wrap">
            <h2 style={{ marginBottom: 'var(--space-lg)' }}>Similar Vehicles</h2>
            <div className="grid-4">
              {similar.map((c) => (
                <CarCard key={c.id} car={c} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
