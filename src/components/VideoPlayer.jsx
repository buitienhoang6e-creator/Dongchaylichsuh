import { useEffect, useState } from 'react';
import { ExternalLink, Play, ShieldCheck, TriangleAlert } from 'lucide-react';

/**
 * Trình phát YouTube kiểu "mặt tiền": chỉ hiện ảnh thu nhỏ,
 * khi người học bấm phát mới tải trình phát thật (nhẹ trang, ít theo dõi).
 */
export function VideoPlayer({ video, autoPlay = false }) {
  const [active, setActive] = useState(autoPlay);

  useEffect(() => {
    setActive(autoPlay);
  }, [video.youtubeId, autoPlay]);

  if (active) {
    return (
      <div className="video-frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&hl=vi&modestbranding=1`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="video-frame video-facade"
      onClick={() => setActive(true)}
      aria-label={`Phát video: ${video.title}`}
    >
      <img src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`} alt="" loading="lazy" />
      <span className="video-play" aria-hidden="true">
        <Play size={30} fill="currentColor" />
      </span>
      {video.duration && <span className="video-duration">{video.duration}</span>}
    </button>
  );
}

export function VideoInfo({ video }) {
  return (
    <div className="video-info">
      <p className="video-info-title">{video.title}</p>
      <p className="video-info-channel">
        Kênh <strong>{video.channel}</strong>
        {video.duration && <>, dài {video.duration}</>}
      </p>
      {video.verify && (
        <p className="video-info-verify">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>{video.verify}</span>
        </p>
      )}
      {video.note && (
        <p className="video-info-note">
          <TriangleAlert size={16} aria-hidden="true" />
          <span>{video.note}</span>
        </p>
      )}
      <a
        className="video-info-link"
        href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
        target="_blank"
        rel="noreferrer"
      >
        Mở trên YouTube <ExternalLink size={14} aria-hidden="true" />
      </a>
    </div>
  );
}
