import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import './ImageGallery.css';

export default function ImageGallery({ images, alt }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const goTo = (idx) => {
    if (idx >= 0 && idx < images.length) setActiveIndex(idx);
  };

  return (
    <>
      <div className="image-gallery">
        <div className="image-gallery__main" onClick={() => setLightbox(true)}>
          <div className="image-gallery__main-ratio">
            <img src={images[activeIndex]} alt={alt} />
          </div>
        </div>
        {images.length > 1 && (
          <div className="image-gallery__thumbs">
            {images.map((img, idx) => (
              <button
                key={idx}
                className={`image-gallery__thumb${idx === activeIndex ? ' image-gallery__thumb--active' : ''}`}
                onClick={() => setActiveIndex(idx)}
              >
                <img src={img} alt={`${alt} view ${idx + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div className="image-gallery__lightbox" onClick={() => setLightbox(false)}>
          <button className="image-gallery__lightbox-close" onClick={() => setLightbox(false)}>
            <X size={24} />
          </button>
          <button
            className="image-gallery__lightbox-nav image-gallery__lightbox-nav--prev"
            onClick={(e) => { e.stopPropagation(); goTo(activeIndex - 1); }}
            disabled={activeIndex === 0}
          >
            <ChevronLeft size={32} />
          </button>
          <div className="image-gallery__lightbox-img" onClick={(e) => e.stopPropagation()}>
            <img src={images[activeIndex]} alt={alt} />
          </div>
          <button
            className="image-gallery__lightbox-nav image-gallery__lightbox-nav--next"
            onClick={(e) => { e.stopPropagation(); goTo(activeIndex + 1); }}
            disabled={activeIndex === images.length - 1}
          >
            <ChevronRight size={32} />
          </button>
          <div className="image-gallery__lightbox-counter">
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
