import { Link } from 'react-router-dom';
import { Fuel, Gauge, Settings } from 'lucide-react';
import { useExchangeRate } from '../hooks/useExchangeRate';
import { formatPrice } from '../lib/currency';
import './CarCard.css';

export default function CarCard({ car }) {
  const { rate } = useExchangeRate();

  return (
    <Link to={`/stock/${car.id}`} className="car-card">
      <div className="car-card__image-wrap">
        <div className="car-card__image-ratio">
          <img src={car.images[0]} alt={`${car.year} ${car.make} ${car.model}`} loading="lazy" />
        </div>
        {car.badge && (
          <span className={`car-card__badge car-card__badge--${car.badge.toLowerCase()}`}>
            {car.badge}
          </span>
        )}
      </div>

      <div className="car-card__body">
        <div className="car-card__header">
          <h3 className="car-card__title">{car.make} {car.model}</h3>
          <span className="car-card__year">{car.year}</span>
        </div>

        <div className="car-card__specs">
          <span className="car-card__spec">
            <Gauge size={13} />
            {car.mileage.toLocaleString()} km
          </span>
          <span className="car-card__spec">
            <Fuel size={13} />
            {car.fuel}
          </span>
          <span className="car-card__spec">
            <Settings size={13} />
            {car.transmission}
          </span>
        </div>

        <div className="car-card__footer">
          <div className="car-card__price-group">
            <span className="car-card__fob">FOB Japan</span>
            <span className="car-card__price">{formatPrice(car.price, rate)}</span>
          </div>
          <span className="car-card__view">View Details</span>
        </div>
      </div>
    </Link>
  );
}
