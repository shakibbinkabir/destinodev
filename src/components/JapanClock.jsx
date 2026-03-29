import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import './JapanClock.css';

export default function JapanClock() {
  const [time, setTime] = useState(getJapanTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getJapanTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function getJapanTime() {
    const now = new Date();
    return {
      time: now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Tokyo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
      date: now.toLocaleDateString('en-US', {
        timeZone: 'Asia/Tokyo',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    };
  }

  return (
    <div className="japan-clock">
      <div className="japan-clock__icon">
        <Clock size={13} />
      </div>
      <div className="japan-clock__info">
        <span className="japan-clock__label">Japan (JST)</span>
        <span className="japan-clock__time">{time.time}</span>
      </div>
    </div>
  );
}
