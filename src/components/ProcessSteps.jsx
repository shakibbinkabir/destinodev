import { Search, ClipboardCheck, Ship, ThumbsUp } from 'lucide-react';
import './ProcessSteps.css';

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Browse & Select",
    description: "Search our extensive inventory or tell us exactly what you need. We have access to thousands of vehicles through Japanese auctions."
  },
  {
    number: "02",
    icon: ClipboardCheck,
    title: "Inspection & Purchase",
    description: "Every vehicle undergoes a thorough inspection. We provide detailed reports with photos so you can purchase with confidence."
  },
  {
    number: "03",
    icon: Ship,
    title: "Shipping & Export",
    description: "We handle all export documentation, customs clearance, and international shipping to your nearest port."
  },
  {
    number: "04",
    icon: ThumbsUp,
    title: "Receive & Enjoy",
    description: "Your vehicle arrives at the designated port. We assist with any local import requirements and after-sales support."
  }
];

export default function ProcessSteps() {
  return (
    <div className="process-steps">
      {steps.map((step, idx) => (
        <div key={idx} className="process-steps__item">
          <span className="process-steps__number">STEP {step.number}</span>
          <div className="process-steps__icon">
            <step.icon size={24} />
          </div>
          <h3 className="process-steps__title">{step.title}</h3>
          <p className="process-steps__desc">{step.description}</p>
        </div>
      ))}
    </div>
  );
}
