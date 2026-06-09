import { Instagram } from 'lucide-react';
import './SocialFeeds.css';

/**
 * Instagram profile CTA. Instagram has no token-free profile-feed embed (a live
 * grid needs a Graph API token, which we don't have — see backend BLOCKERS.md),
 * so we link out to the profile at `url` (the `social.instagram` setting). The
 * homepage only mounts this when `homepage.instagram_enabled` is on and `url`
 * is set. An operator can swap this for a third-party widget later.
 */
function handleFromUrl(url) {
  try {
    const parts = new URL(url).pathname.replace(/\/+$/, '').split('/').filter(Boolean);
    return parts.length ? `@${parts[parts.length - 1]}` : 'Instagram';
  } catch {
    return 'Instagram';
  }
}

export default function InstagramFeed({ url }) {
  if (!url) return null;

  return (
    <a
      className="social-feed social-feed--instagram"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Instagram size={40} />
      <span className="social-feed__instagram-cta">View our Instagram</span>
      <span className="social-feed__instagram-handle">{handleFromUrl(url)}</span>
    </a>
  );
}
