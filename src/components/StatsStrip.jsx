import { Car, Globe, Award, TrendingUp } from 'lucide-react';
import './StatsStrip.css';

const defaultStats = [
  { icon: Car, value: "2,400+", label: "Vehicles in Stock" },
  { icon: Globe, value: "50+", label: "Countries Served" },
  { icon: Award, value: "29", label: "Years Experience" },
  { icon: TrendingUp, value: "15,000+", label: "Cars Exported" },
];

export default function StatsStrip({ stats }) {
  const data = stats || defaultStats;

  return (
    <div className="stats-strip">
      <div className="stats-strip__inner wrap">
        {data.map((stat, idx) => (
          <div key={idx} className="stats-strip__item">
            {stat.icon && <stat.icon size={22} className="stats-strip__icon" />}
            <span className="stats-strip__value">{stat.value}</span>
            <span className="stats-strip__label">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
