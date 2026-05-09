import { apiPost } from './client';

/**
 * Submits an inquiry per PRD §8.4. The legacy InquiryForm collects
 * `inquiryType` (vehicle/quote/etc.) which has no first-class column on
 * the backend; we fold it into the message body so the data is preserved
 * and the admin sees it inline. Returns the unwrapped data: {id, received_at}.
 */
export async function submitInquiry(payload, options) {
  const inquiryType = (payload.inquiryType || '').trim();
  const baseMessage = (payload.message || '').trim();
  const message = inquiryType
    ? `Inquiry Type: ${inquiryType}\n\n${baseMessage}`
    : baseMessage;

  const body = {
    name: payload.name,
    email: payload.email,
    phone: payload.phone || null,
    country: payload.country || null,
    message,
    source: payload.source || 'contact_page',
  };

  if (payload.car_id !== undefined && payload.car_id !== null && payload.car_id !== '') {
    body.car_id = Number(payload.car_id);
  }
  if (payload.carReference) {
    body.car_reference = String(payload.carReference).slice(0, 120);
  }

  const res = await apiPost('/inquiries', body, options);
  return res?.data || null;
}
