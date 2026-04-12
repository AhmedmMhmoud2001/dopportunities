import './HowItWorksSection.css';
import defaultPoster from '../assets/images/HowItWorksSection.png';
import AnimatedSection from './AnimatedSection';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest, resolvePublicAssetUrl } from '../lib/api';

const DEFAULT_HEADING = '# كيف تعمل خدماتنا ؟';
const DEFAULT_BODY =
  'لوريم ايبسوم دولار سيت أميت يوت دونك، ميو كويس لامبور إي نوسترو كويس كويرات. كونسيكوات. يوت أليكوي دونك، يوت كونسيكوات. إنيم ديتيكتورمي ديواس إيليت، ماجنا إي ديتيكتورمي كونسيكتيتور كويس ديواس إنكيديديونت نيسيوت أولامكو نوسترو إنيم لابوري نويس إيليت، أليكوي.';

function getYoutubeEmbed(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=1`;
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
  } catch {
    return null;
  }
  return null;
}

function isDirectVideoUrl(url: string): boolean {
  const lower = url.trim().toLowerCase();
  return /\.(mp4|webm|ogg)(\?|$)/i.test(lower);
}

function HowItWorksSection() {
  const [heading, setHeading] = useState(DEFAULT_HEADING);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiRequest<{
          howHeading?: string;
          howBody?: string;
          howVideoUrl?: string | null;
          howPosterUrl?: string | null;
        }>('/v1/home-intro');
        if (cancelled) return;
        if (res?.howHeading) setHeading(res.howHeading);
        if (res?.howBody != null) setBody(res.howBody);
        setVideoUrl(res?.howVideoUrl?.trim() ? res.howVideoUrl.trim() : null);
        setPosterUrl(res?.howPosterUrl?.trim() ? res.howPosterUrl.trim() : null);
      } catch {
        /* defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const posterSrc = useMemo(() => {
    if (posterUrl) return resolvePublicAssetUrl(posterUrl);
    return defaultPoster;
  }, [posterUrl]);

  const youtubeEmbed = videoUrl ? getYoutubeEmbed(videoUrl) : null;
  const directVideo = videoUrl && !youtubeEmbed && isDirectVideoUrl(videoUrl);

  const resolvedVideoSrc = videoUrl && directVideo ? resolvePublicAssetUrl(videoUrl) : '';

  return (
    <section className="how-it-works-section">
      <div className="container">
        <AnimatedSection animationType="fade-in-down" delay={0} className="how-it-works-heading-wrap">
          <h2 className="section-title how-it-works-heading">{heading}</h2>
        </AnimatedSection>
        <div className="how-it-works-content">
          <AnimatedSection animationType="fade-in-right" delay={100}>
            <div className="how-it-works-text">
              <p className="section-description">{body}</p>
            </div>
          </AnimatedSection>
          <AnimatedSection animationType="zoom-in" delay={300}>
            <div className="video-container">
              <div className="video-frame hover-scale">
                {playing && youtubeEmbed ? (
                  <iframe
                    className="video-thumbnail video-iframe"
                    src={youtubeEmbed}
                    title="Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : playing && directVideo && resolvedVideoSrc ? (
                  <video
                    className="video-thumbnail"
                    src={resolvedVideoSrc}
                    controls
                    autoPlay
                    playsInline
                  />
                ) : (
                  <>
                    <img src={posterSrc} alt="" className="video-thumbnail" />
                    {videoUrl ? (
                      <button
                        type="button"
                        className="play-button animate-pulse how-it-works-play"
                        aria-label="تشغيل الفيديو"
                        onClick={() => setPlaying(true)}
                      >
                        <div className="play-button-icon">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 5v14l11-7z" fill="currentColor" />
                          </svg>
                        </div>
                      </button>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
