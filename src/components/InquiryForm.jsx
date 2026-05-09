import { useState } from 'react';
import { Send, AlertTriangle, MessageCircle } from 'lucide-react';
import { submitInquiry } from '../api/inquiries';
import { ApiError } from '../api/client';
import './InquiryForm.css';

const countries = [
  "South Africa", "Kenya", "Tanzania", "Mozambique", "Uganda",
  "United Arab Emirates", "Oman", "Bahrain", "Kuwait",
  "New Zealand", "Fiji", "Papua New Guinea", "Samoa",
  "Jamaica", "Trinidad and Tobago", "Barbados", "Guyana",
  "Singapore", "Thailand", "Myanmar",
  "United Kingdom", "Ireland",
  "Other"
];

const inquiryTypes = [
  "Vehicle Inquiry",
  "Request a Quote",
  "Auction Sourcing",
  "Shipping Inquiry",
  "General Question",
  "After-Sales Support"
];

const WHATSAPP_FALLBACK = 'https://wa.me/81459496777';

export default function InquiryForm({ carReference, carId, source }) {
  const defaultSource = source || (carReference ? 'single_car' : 'contact_page');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    inquiryType: carReference ? 'Vehicle Inquiry' : '',
    message: carReference ? `I am interested in: ${carReference}\n\nPlease provide pricing and shipping details.` : '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      const next = { ...fieldErrors };
      delete next[e.target.name];
      setFieldErrors(next);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors({});

    try {
      await submitInquiry({
        name: form.name,
        email: form.email,
        phone: form.phone,
        country: form.country,
        inquiryType: form.inquiryType,
        message: form.message,
        source: defaultSource,
        car_id: carId,
        carReference,
      });
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422 && err.errors) {
        // Field-level validation errors. The PRD guarantees errors is
        // {field: [messages]}. We collapse to first message per field.
        const next = {};
        for (const [field, msgs] of Object.entries(err.errors)) {
          if (Array.isArray(msgs) && msgs.length > 0) {
            next[field] = msgs[0];
          }
        }
        setFieldErrors(next);
        setSubmitError('Please correct the highlighted fields.');
      } else if (err instanceof ApiError) {
        setSubmitError(err.message || 'We could not send your inquiry. Please try again.');
      } else {
        setSubmitError('We could not send your inquiry. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="inquiry-form__success">
        <h3>Thank you for your inquiry</h3>
        <p>Our team will respond within 24 hours during business days.</p>
      </div>
    );
  }

  return (
    <form className="inquiry-form" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <div className="inquiry-form__error" role="alert">
          <AlertTriangle size={16} />
          <div className="inquiry-form__error-body">
            <strong>{submitError}</strong>
            <span>
              Trouble reaching us? Message us on{' '}
              <a href={WHATSAPP_FALLBACK} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={12} />
                WhatsApp
              </a>{' '}
              instead.
            </span>
          </div>
        </div>
      )}

      <div className="inquiry-form__row">
        <div className="inquiry-form__field">
          <label className="inquiry-form__label">Name *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="inquiry-form__input"
          />
          {fieldErrors.name && <span className="inquiry-form__field-error">{fieldErrors.name}</span>}
        </div>
        <div className="inquiry-form__field">
          <label className="inquiry-form__label">Email *</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="inquiry-form__input"
          />
          {fieldErrors.email && <span className="inquiry-form__field-error">{fieldErrors.email}</span>}
        </div>
      </div>

      <div className="inquiry-form__row">
        <div className="inquiry-form__field">
          <label className="inquiry-form__label">Phone *</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            className="inquiry-form__input"
          />
          {fieldErrors.phone && <span className="inquiry-form__field-error">{fieldErrors.phone}</span>}
        </div>
        <div className="inquiry-form__field">
          <label className="inquiry-form__label">Country</label>
          <select
            name="country"
            value={form.country}
            onChange={handleChange}
            className="inquiry-form__select"
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {fieldErrors.country && <span className="inquiry-form__field-error">{fieldErrors.country}</span>}
        </div>
      </div>

      <div className="inquiry-form__field">
        <label className="inquiry-form__label">Inquiry Type</label>
        <select
          name="inquiryType"
          value={form.inquiryType}
          onChange={handleChange}
          className="inquiry-form__select"
        >
          <option value="">Select Type</option>
          {inquiryTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="inquiry-form__field">
        <label className="inquiry-form__label">Message *</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          required
          rows={5}
          className="inquiry-form__textarea"
        />
        {fieldErrors.message && <span className="inquiry-form__field-error">{fieldErrors.message}</span>}
      </div>

      <button type="submit" className="inquiry-form__submit btn btn--primary btn--full btn--lg" disabled={submitting}>
        <Send size={16} />
        {submitting ? 'Sending...' : 'Send Inquiry'}
      </button>
    </form>
  );
}
