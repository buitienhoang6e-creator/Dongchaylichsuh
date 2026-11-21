import { useEffect, useState } from 'react';

/** Ảnh minh họa sự kiện kèm ghi nguồn; nếu chưa có ảnh (hoặc ảnh lỗi) thì hiện bảng niên đại. */
export default function EventImage({
  event,
  className = '',
  showCredit = true,
  eager = false,
  sizes = '(max-width: 760px) 92vw, 640px',
}) {
  const img = event.image;
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [img?.src]);

  if (!img || failed) {
    return (
      <div className={`event-image is-placeholder ${className}`} role="img" aria-label={event.title}>
        <span className="placeholder-year">{event.yearLabel}</span>
        <span className="placeholder-title">{event.shortTitle}</span>
      </div>
    );
  }
  const small = img.src.replace(/\.jpg$/, '-sm.jpg');
  return (
    <figure className={`event-image ${className}`}>
      <img
        src={small}
        srcSet={`${small} 720w, ${img.src} 1400w`}
        sizes={sizes}
        alt={img.alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setFailed(true)}
        style={img.position ? { objectPosition: img.position } : undefined}
      />
      {showCredit && (img.credit || img.license) && (
        <figcaption>
          {img.source ? (
            <a href={img.source} target="_blank" rel="noreferrer">
              {img.credit}
            </a>
          ) : (
            img.credit
          )}
          {img.license && <>, {img.license}</>}
        </figcaption>
      )}
    </figure>
  );
}
