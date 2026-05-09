import './Loading.css';

export default function Loading({ label = 'Loading…', inline = false }) {
  return (
    <div className={`loading${inline ? ' loading--inline' : ''}`} role="status" aria-live="polite">
      <span className="loading__spinner" aria-hidden="true" />
      <span className="loading__label">{label}</span>
    </div>
  );
}
