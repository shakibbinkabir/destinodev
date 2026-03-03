import { useState } from 'react';
import { Send } from 'lucide-react';
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

export default function InquiryForm({ carReference }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    inquiryType: carReference ? 'Vehicle Inquiry' : '',
    message: carReference ? `I am interested in: ${carReference}\n\nPlease provide pricing and shipping details.` : '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
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
    <form className="inquiry-form" onSubmit={handleSubmit}>
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
      </div>

      <button type="submit" className="inquiry-form__submit btn btn--primary btn--full btn--lg">
        <Send size={16} />
        Send Inquiry
      </button>
    </form>
  );
}
