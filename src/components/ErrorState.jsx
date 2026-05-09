import { AlertTriangle, RotateCcw } from 'lucide-react';
import './ErrorState.css';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this section. Please try again.',
  onRetry,
}) {
  return (
    <div className="error-state" role="alert">
      <div className="error-state__icon">
        <AlertTriangle size={20} />
      </div>
      <div className="error-state__body">
        <h4 className="error-state__title">{title}</h4>
        <p className="error-state__message">{message}</p>
        {onRetry && (
          <button type="button" className="error-state__retry btn btn--outline" onClick={onRetry}>
            <RotateCcw size={14} />
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
