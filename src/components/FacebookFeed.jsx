import './SocialFeeds.css';

/**
 * Official Facebook Page Plugin embed (no API token required). Renders the
 * timeline of the page at `url` — Facebook's plugin takes the page's public
 * URL, not an API call. Driven by the `social.facebook` setting; the homepage
 * only mounts this when `homepage.facebook_enabled` is on and `url` is set.
 */
export default function FacebookFeed({ url }) {
  if (!url) return null;

  const src =
    'https://www.facebook.com/plugins/page.php?href=' +
    encodeURIComponent(url) +
    '&tabs=timeline&width=500&height=620&small_header=false' +
    '&adapt_container_width=true&hide_cover=false&show_facepile=true';

  return (
    <div className="social-feed social-feed--facebook">
      <iframe
        title="Facebook"
        src={src}
        className="social-feed__facebook-frame"
        scrolling="no"
        loading="lazy"
        allow="encrypted-media; clipboard-write"
        allowFullScreen
      />
    </div>
  );
}
