import { useApi } from '../hooks/useApi';
import { getProcessSteps } from '../api/site';
import { resolveIcon } from './iconMap';
import Loading from './Loading';
import ErrorState from './ErrorState';
import './ProcessSteps.css';

const FALLBACK_ICONS = ['Search', 'ClipboardCheck', 'Ship', 'ThumbsUp'];

export default function ProcessSteps() {
  const { data, loading, error, refetch } = useApi(
    (signal) => getProcessSteps({ signal }),
    [],
  );

  if (loading) return <Loading label="Loading steps…" />;
  if (error) return <ErrorState onRetry={refetch} />;

  const steps = data || [];

  return (
    <div className="process-steps">
      {steps.map((step, idx) => {
        const Icon = resolveIcon(step.icon, FALLBACK_ICONS[idx % FALLBACK_ICONS.length]);
        const number = String(idx + 1).padStart(2, '0');
        return (
          <div key={step.id} className="process-steps__item">
            <span className="process-steps__number">STEP {number}</span>
            <div className="process-steps__icon">
              <Icon size={24} />
            </div>
            <h3 className="process-steps__title">{step.title}</h3>
            <p className="process-steps__desc">{step.description}</p>
          </div>
        );
      })}
    </div>
  );
}
