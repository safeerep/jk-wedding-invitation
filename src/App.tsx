import React, { useState, useEffect, useRef } from 'react';

/**
 * ============================================================================
 * ASSET CONFIGURATION
 * Replace these URLs with your local paths (e.g., "/assets/hero.jpg")
 * when deploying with your own photography and audio files.
 * ============================================================================
 */
const ASSETS = {
  heroDesktop:
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=85',
  heroMobile:
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85',
  memory:
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85',
  portrait:
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85',
  galleryExtra:
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=85',
  // Dynamic QR code pointing directly to Emerald Palace Google Maps link
  locationQr:
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=071f1b&bgcolor=ffffff&data=' +
    encodeURIComponent('https://maps.app.goo.gl/7dC7fb8JY9TztAum9'),
  // Replace with "/assets/wedding-music.mp3" for your custom track
  musicSrc: './assets/tu-zariya.mp3',
};

const MAPS_URL = 'https://maps.app.goo.gl/7dC7fb8JY9TztAum9';
const WEDDING_DATE_ISO = '2026-12-27T11:00:00+05:30';

/**
 * Reusable Scroll-Reveal Wrapper using IntersectionObserver
 */
const Reveal = ({ children, className = '', delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default function App() {
  // Envelope / Intro splash state (starts closed/visible so guests open it)
  const [isOpened, setIsOpened] = useState(false);

  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const synthCtxRef = useRef(null);
  const synthIntervalRef = useRef(null);

  // Live countdown state
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  // Lightbox state for gallery memories
  const [lightboxImg, setLightboxImg] = useState(null);

  // Inject Google Fonts & custom keyframe animations
  useEffect(() => {
    const fontId = 'jasim-fathima-fonts';
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@400;500;600&family=Scheherazade+New:wght@500;600&display=swap';
      document.head.appendChild(link);
    }
    document.title = 'Jasim Karimbumkandathil & Fathima Rinzi — Wedding Invitation';
  }, []);

  // Lock body scroll while intro overlay is active
  useEffect(() => {
    document.body.style.overflow = isOpened ? 'auto' : 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpened]);

  // Live Countdown Timer
  useEffect(() => {
    const target = new Date(WEDDING_DATE_ISO).getTime();

    const updateCountdown = () => {
      const diff = Math.max(0, target - Date.now());
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor(diff / 3600000) % 24;
      const minutes = Math.floor(diff / 60000) % 60;
      const seconds = Math.floor(diff / 1000) % 60;

      setTimeLeft({
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // Gentle Web Audio ambient chord fallback when no external MP3 is configured
  const startAmbientFallback = () => {
    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      if (!synthCtxRef.current) {
        synthCtxRef.current = new AudioContextClass();
      }
      const ctx = synthCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Soft warm pentatonic chime sequence
      const notes = [261.63, 329.63, 392.0, 493.88, 523.25];
      let step = 0;

      const playNote = () => {
        if (!synthCtxRef.current) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[step % notes.length], now);
        step += 1;

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.035, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 3.8);
      };

      playNote();
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = setInterval(playNote, 3200);
    } catch {
      // Ignore autoplay restrictions if any
    }
  };

  const stopAmbientFallback = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (synthCtxRef.current && synthCtxRef.current.state === 'running') {
      synthCtxRef.current.suspend();
    }
  };

  useEffect(() => {
    return () => {
      stopAmbientFallback();
    };
  }, []);

  const playMusic = async () => {
    if (ASSETS.musicSrc && audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        return;
      } catch {
        // Fallback to ambient chime if MP3 fails
      }
    }
    startAmbientFallback();
    setIsPlaying(true);
  };

  const pauseMusic = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
    stopAmbientFallback();
    setIsPlaying(false);
  };

  const handleOpenInvitation = async () => {
    setIsOpened(true);
    await playMusic();
  };

  const toggleMusic = async () => {
    if (isPlaying) {
      pauseMusic();
    } else {
      await playMusic();
    }
  };

  // Generate and download .ics Calendar File
  const handleDownloadCalendar = () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Jasim & Fathima//Wedding//EN',
      'BEGIN:VEVENT',
      'UID:jasim-fathima-20261227@wedding.invite',
      'DTSTAMP:20261201T000000Z',
      'DTSTART:20261227T053000Z',
      'DTEND:20261227T093000Z',
      'SUMMARY:Jasim Karimbumkandathil & Fathima Rinzi — Wedding Celebration',
      'LOCATION:Emerald Palace, Kurukkol, Kerala',
      'DESCRIPTION:Wedding celebration of Jasim Karimbumkandathil & Fathima Rinzi (11:00 AM - 3:00 PM IST).',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Jasim-Fathima-Wedding.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const galleryImages = [
    { src: ASSETS.heroDesktop, alt: 'Jasim and Fathima — Moment 1' },
    { src: ASSETS.portrait, alt: 'Jasim and Fathima — Moment 2' },
    { src: ASSETS.memory, alt: 'Jasim and Fathima — Moment 3' },
  ];

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden bg-[#f7f2e8] text-[#20332e] selection:bg-[#071f1b] selection:text-[#d0ac67]"
      style={{ fontFamily: '"DM Sans", sans-serif' }}
    >
      {/* Custom Styles for Keyframes & Font Helpers */}
      <style>{`
        html {
          scroll-behavior: smooth;
        }
        .font-serif-editorial {
          font-family: "Cormorant Garamond", Georgia, serif;
        }
        .font-arabic {
          font-family: "Scheherazade New", serif;
        }
        @keyframes slowZoom {
          0% { transform: scale(1.03); }
          100% { transform: scale(1.12); }
        }
        .animate-slow-zoom {
          animation: slowZoom 14s ease-out forwards;
        }
        @keyframes floatCue {
          0%, 100% {
            transform: translate(-50%, 0);
            opacity: 0.78;
          }
          50% {
            transform: translate(-50%, 7px);
            opacity: 1;
          }
        }
        .animate-float-cue {
          animation: floatCue 2.2s ease-in-out infinite;
        }
      `}</style>

      {/* Subtle Paper Grain Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[99] opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* =====================================================================
          1. INTERACTIVE ENVELOPE / INTRO SPLASH OVERLAY
      ===================================================================== */}
      <div
        className={`fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#061a17] text-white transition-all duration-1000 ${
          isOpened
            ? 'pointer-events-none invisible opacity-0'
            : 'visible opacity-100'
        }`}
      >
        {/* Slow-zooming Hero Background */}
        <div
          className="animate-slow-zoom absolute -inset-[4%] bg-cover bg-[center_12%] saturate-75"
          style={{ backgroundImage: `url("${ASSETS.heroDesktop}")` }}
        />
        {/* Dark Emerald Gradient Shade */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(2,19,16,0.32) 0%, rgba(2,19,16,0.88) 100%)',
          }}
        />
        {/* Concentric Gold Ring */}
        <div className="pointer-events-none absolute h-[108vw] w-[108vw] max-h-[800px] max-w-[800px] rounded-full border border-[#d0ac67]/45 shadow-[0_0_0_30px_rgba(208,172,103,0.035)] sm:h-[74vw] sm:w-[74vw]" />

        {/* Intro Content */}
        <div className="relative z-10 px-6 text-center">
          <p className="font-arabic text-[22px] text-[#ead49f] sm:text-[25px]">
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
          </p>
          <p className="mt-2 text-[9px] font-semibold tracking-[0.28em] text-white/90 uppercase">
            A WEDDING INVITATION
          </p>
          <h1 className="font-serif-editorial my-4 text-[56px] leading-[0.84] font-normal italic sm:text-[76px]">
            Jasim{' '}
            <span className="not-italic text-[0.55em] text-[#d0ac67]">
              &amp;
            </span>{' '}
            Fathima
          </h1>
          <p className="font-arabic text-[26px] text-[#e8d29a] sm:text-[29px]">
            جاسم &amp; فاطمة رنزي
          </p>

          <button
            type="button"
            onClick={handleOpenInvitation}
            className="mt-6 inline-flex cursor-pointer items-center rounded-full border border-[#d0ac67]/80 bg-[#071f1b]/60 px-7 py-3.5 text-[10px] font-semibold tracking-[0.18em] text-white uppercase backdrop-blur-xs transition-all duration-300 hover:border-[#d0ac67] hover:bg-[#0b3b32] active:scale-95"
          >
            Open Invitation
            <span className="ml-2.5 text-sm leading-none text-[#d0ac67]">
              →
            </span>
          </button>
        </div>

        {/* Bottom Gold Ornament */}
        <div className="absolute bottom-7 text-[25px] text-[#d0ac67]">✦</div>
      </div>

      {/* =====================================================================
          MAIN INVITATION CONTENT
      ===================================================================== */}
      <main id="page">
        {/* ===================================================================
            2. HERO SECTION
        =================================================================== */}
        <section className="relative grid h-svh min-h-[660px] w-full place-items-center overflow-hidden text-center text-white">
          {/* Desktop Background */}
          <div
            className="animate-slow-zoom absolute inset-0 hidden bg-cover bg-[center_12%] sm:block"
            style={{ backgroundImage: `url("${ASSETS.heroDesktop}")` }}
          />
          {/* Mobile Background */}
          <div
            className="animate-slow-zoom absolute inset-0 block bg-cover bg-top sm:hidden"
            style={{ backgroundImage: `url("${ASSETS.heroMobile}")` }}
          />
          {/* Atmospheric Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(3,22,19,0.32) 0%, rgba(3,22,19,0.44) 45%, rgba(3,22,19,0.92) 100%)',
            }}
          />

          {/* Hero Inner Frame */}
          <div className="relative z-10 flex h-full w-full max-w-[980px] flex-col items-center justify-between px-5 pt-[7vh] pb-[13vh]">
            {/* Top Bismillah & Subtitle */}
            <div className="flex flex-col items-center gap-2">
              <p className="font-arabic m-0 text-[21px] text-[#e8cf91] sm:text-[26px]">
                بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
              </p>
              <p className="m-0 text-[8px] font-semibold tracking-[0.26em] text-white uppercase sm:text-[9px] sm:tracking-[0.30em]">
                FROM THEIR KITH &amp; KIN
              </p>
            </div>

            {/* Center Couple Title & Date */}
            <div className="-mt-[1vh] flex flex-col items-center justify-center">
              <h2 className="font-serif-editorial m-0 text-[clamp(52px,14vw,98px)] leading-[0.84] font-normal italic sm:whitespace-nowrap">
                Jasim{' '}
                <span className="not-italic text-[0.58em] text-[#d0ac67]">
                  &amp;
                </span>{' '}
                Fathima
              </h2>
              <p className="font-arabic mt-4 mb-2 text-[25px] text-[#e7ce91] sm:text-[31px]">
                جاسم &amp; فاطمة رنزي
              </p>
              <p className="m-0 text-[10px] font-medium tracking-[0.28em] text-[#e4ca8c] uppercase">
                27 · DECEMBER · 2026
              </p>

              {/* Gold Diamond Ornament Divider */}
              <div className="my-2.5 flex h-8 w-[150px] items-center justify-center gap-2.5 text-[#d0ac67] sm:w-[175px]">
                <span className="h-px w-[52px] bg-[#d0ac67]/65 sm:w-[65px]" />
                <span className="text-xs">✦</span>
                <span className="h-px w-[52px] bg-[#d0ac67]/65 sm:w-[65px]" />
              </div>

              <p className="font-serif-editorial m-0 text-[21px] leading-[1.25] text-white italic drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)] sm:text-[24px]">
                invite you to share in the joy
                <br />
                of their wedding celebration
              </p>
            </div>

            {/* Bottom Swipe Up Cue */}
            <a
              href="#invitation"
              aria-label="Scroll to continue"
              className="animate-float-cue absolute bottom-7 left-1/2 z-20 flex flex-col items-center gap-1.5 text-center text-white no-underline"
            >
              <span
                className="mb-0.5 h-px w-[110px] sm:w-[130px]"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(208,172,103,0.75), transparent)',
                }}
              />
              <span className="text-[8px] font-semibold tracking-[0.22em] whitespace-nowrap uppercase drop-shadow-[0_1px_10px_rgba(0,0,0,0.85)] sm:text-[9px] sm:tracking-[0.25em]">
                SWIPE UP TO EXPLORE
              </span>
              <span className="block text-[30px] leading-[0.6] text-[#d0ac67] drop-shadow-[0_1px_10px_rgba(0,0,0,0.85)]">
                ⌄
              </span>
            </a>
          </div>
        </section>

        {/* ===================================================================
            3. THE INVITATION & FAMILY LINEAGE SECTION
        =================================================================== */}
        <section id="invitation" className="px-[7vw] py-24 sm:py-28">
          <Reveal className="mx-auto max-w-[1050px]">
            <p className="text-[9px] font-semibold tracking-[0.28em] text-[#98763d] uppercase">
              THE INVITATION
            </p>
            <h2 className="font-serif-editorial mt-2 mb-7 text-[clamp(48px,7vw,80px)] leading-[0.86] font-medium">
              With love,
              <br />
              <em className="font-normal text-[#98763d]">we invite you.</em>
            </h2>
            <p className="max-w-[570px] text-[15px] leading-[1.75] text-[#718079]">
              With the blessings of their families, we, their{' '}
              <strong className="font-semibold text-[#20332e]">
                kith and kin
              </strong>
              ,
              <br className="hidden sm:inline" /> cordially invite you to share
              in their joyous celebration.
            </p>

            {/* 3-Column Bordered Couple & Family Grid */}
            <div className="my-9 grid max-w-[820px] grid-cols-1 items-center gap-6 border-y border-[#d6c8ad] py-7 text-center sm:grid-cols-[1fr_54px_1fr] sm:gap-2">
              <div className="px-2">
                <strong className="font-serif-editorial block text-[26px] leading-tight font-medium tracking-[0.04em] text-[#20332e] sm:text-[28px]">
                  JASIM KARIMBUMKANDATHIL
                </strong>
                <span className="font-serif-editorial mt-1.5 block text-[17px] leading-[1.4] text-[#718079]">
                  S/o Mujeeb Rahman &amp; Raheena
                </span>
                <small className="mt-1.5 block text-[12px] leading-[1.55] text-[#718079]">
                  Karimbumkandathil House
                  <br />

                </small>
              </div>

              <div className="font-serif-editorial text-[36px] text-[#d0ac67] italic">
                &amp;
              </div>

              <div className="px-2">
                <strong className="font-serif-editorial block text-[26px] leading-tight font-medium tracking-[0.04em] text-[#20332e] sm:text-[28px]">
                  FATHIMA RINZI
                </strong>
                <span className="font-serif-editorial mt-1.5 block text-[17px] leading-[1.4] text-[#718079]">
                  D/o Asainar &amp; 
                </span>
                <small className="mt-1.5 block text-[12px] leading-[1.55] text-[#718079]">
                  VV
  
                </small>
              </div>
            </div>

            <p className="max-w-[570px] text-[15px] leading-[1.75] text-[#718079]">
              We request the pleasure of your gracious presence and blessings as
              they begin this beautiful journey together.
            </p>
          </Reveal>
        </section>

        {/* ===================================================================
            4. QURANIC BLESSING SECTION
        =================================================================== */}
        <section className="relative bg-[#071f1b] px-6 py-28 text-center text-white sm:py-32">
          <Reveal className="mx-auto max-w-[900px] border border-[#d0ac67]/30 px-6 py-16 sm:py-20">
            <p className="text-[9px] font-semibold tracking-[0.28em] text-[#d5be88] uppercase">
              A BLESSING FOR TWO
            </p>
            <div className="font-serif-editorial mt-2 h-[54px] text-[96px] leading-none text-[#d0ac67]">
              “
            </div>
            <p
              dir="rtl"
              className="font-arabic mt-5 mb-2.5 text-[38px] leading-relaxed text-[#ecd9a5] sm:text-[48px]"
            >
              وَخَلَقْنَاكُمْ أَزْوَاجًا
            </p>
            <p className="font-serif-editorial mb-5 text-[30px] leading-snug italic sm:text-[38px]">
              “And We created you in pairs.”
            </p>
            <span className="text-[9px] font-medium tracking-[0.25em] text-[#cdbb8a] uppercase">
              THE QUR’AN · 78:8
            </span>
          </Reveal>
        </section>

        {/* ===================================================================
            5. SAVE THE DATE & LIVE COUNTDOWN SECTION
        =================================================================== */}
        <section className="bg-[#ebe3d3] px-[7vw] py-24 sm:py-28">
          <Reveal className="mx-auto max-w-[1050px]">
            <p className="mb-5 text-[9px] font-semibold tracking-[0.28em] text-[#98763d] uppercase">
              SAVE THE DATE
            </p>

            {/* Elevated White & Emerald Event Card */}
            <div className="grid max-w-[950px] grid-cols-1 overflow-hidden bg-white shadow-[0_25px_65px_rgba(30,40,35,0.1)] md:grid-cols-[280px_1fr]">
              {/* Left Emerald Date Card */}
              <div className="flex min-h-[240px] flex-col items-center justify-center bg-[#071f1b] py-10 text-white md:min-h-[350px]">
                <span className="text-[9px] font-medium tracking-[0.25em] text-[#dfca92] uppercase">
                  SUNDAY
                </span>
                <strong className="font-serif-editorial my-2 text-[96px] leading-[0.82] font-normal sm:text-[112px]">
                  27
                </strong>
                <small className="text-[9px] font-medium tracking-[0.25em] text-[#dfca92] uppercase">
                  DECEMBER 2026
                </small>
              </div>

              {/* Right Event Details */}
              <div className="p-8 sm:p-12 md:p-14">
                <h2 className="font-serif-editorial mt-1 mb-6 text-[52px] leading-[0.84] font-medium sm:text-[66px]">
                  Wedding
                  <br />
                  <em className="font-normal text-[#98763d]">Celebration</em>
                </h2>
                <p className="text-[11px] font-semibold tracking-[0.16em] text-[#98763d] uppercase">
                  11:00 AM — 3:00 PM
                </p>
                <p className="mt-3 text-[15px] leading-[1.7] text-[#718079]">
                  <strong className="font-semibold text-[#20332e]">
                    Emerald Palace
                  </strong>
                  <br />
                  Kurukkol, Kerala
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href={MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-[#071f1b] px-5 py-3.5 text-[10px] font-semibold tracking-[0.1em] text-white uppercase no-underline transition-colors hover:bg-[#0b3b32]"
                  >
                    Get Directions ↗
                  </a>
                  <button
                    type="button"
                    onClick={handleDownloadCalendar}
                    className="inline-flex cursor-pointer items-center justify-center border-0 bg-[#eee6d7] px-5 py-3.5 text-[10px] font-semibold tracking-[0.1em] text-[#071f1b] uppercase transition-colors hover:bg-[#e3d7c1]"
                  >
                    Add to Calendar
                  </button>
                </div>
              </div>
            </div>

            {/* Live Countdown Timer */}
            <div className="mt-16">
              <p className="mb-4 text-[9px] font-semibold tracking-[0.28em] text-[#98763d] uppercase">
                COUNTING DOWN TO THE DAY
              </p>
              <div className="grid max-w-[850px] grid-cols-4 border-y border-[#d5c8ad]">
                {[
                  { label: 'DAYS', value: timeLeft.days },
                  { label: 'HOURS', value: timeLeft.hours },
                  { label: 'MINUTES', value: timeLeft.minutes },
                  { label: 'SECONDS', value: timeLeft.seconds },
                ].map((item, idx) => (
                  <div
                    key={item.label}
                    className={`py-5 text-center sm:py-6 ${
                      idx < 3 ? 'border-r border-[#d5c8ad]' : ''
                    }`}
                  >
                    <strong className="font-serif-editorial block text-[40px] leading-none font-normal text-[#876a37] sm:text-[56px]">
                      {item.value}
                    </strong>
                    <span className="mt-2 block text-[8px] font-medium tracking-[0.18em] text-[#718079] uppercase">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ===================================================================
            6. LOCATION & QR CODE SECTION
        =================================================================== */}
        <section className="grid min-h-[650px] grid-cols-1 lg:grid-cols-2">
          {/* Left Couple / Venue Photo */}
          <div className="min-h-[380px] overflow-hidden lg:min-h-[650px]">
            <img
              src={ASSETS.memory}
              alt="Jasim and Fathima at Emerald Palace"
              className="block h-full w-full object-cover"
            />
          </div>

          {/* Right Location Details & QR */}
          <Reveal className="flex flex-col justify-center px-[7vw] py-20 lg:px-[8vw] lg:py-24">
            <p className="text-[9px] font-semibold tracking-[0.28em] text-[#98763d] uppercase">
              THE LOCATION
            </p>
            <h2 className="font-serif-editorial mt-2 mb-5 text-[clamp(46px,6vw,78px)] leading-[0.86] font-medium">
              Find us at
              <br />
              <em className="font-normal text-[#98763d]">Emerald Palace</em>
            </h2>
            <p className="mb-3 text-[15px] text-[#718079]">
              Kurukkol, Kerala
            </p>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-8 inline-block text-[11px] font-semibold tracking-[0.06em] text-[#071f1b] underline-offset-4 hover:underline"
            >
              Open Google Maps ↗
            </a>

            {/* Styled QR Card */}
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Scan or click QR code for Google Maps directions"
              className="block w-[178px] bg-white p-4 shadow-[0_12px_32px_rgba(32,51,46,0.06)] transition-transform duration-300 hover:-translate-y-1"
            >
              <img
                src={ASSETS.locationQr}
                alt="QR code for Emerald Palace location"
                className="block h-auto w-full"
              />
              <span className="mt-2.5 block text-center text-[7.5px] font-semibold tracking-[0.16em] text-[#98763d] uppercase">
                SCAN FOR DIRECTIONS
              </span>
            </a>
          </Reveal>
        </section>

        {/* ===================================================================
            7. MEMORIES GALLERY SECTION
        =================================================================== */}
        {/* <section className="bg-white px-[7vw] py-24 sm:py-28">
          <Reveal className="mx-auto max-w-[1050px]">
            <p className="text-[9px] font-semibold tracking-[0.28em] text-[#98763d] uppercase">
              A FEW MEMORIES
            </p>
            <h2 className="font-serif-editorial mt-2 mb-9 text-[clamp(48px,7vw,80px)] leading-[0.86] font-medium">
              Before the
              <br />
              <em className="font-normal text-[#98763d]">big day.</em>
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {galleryImages.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setLightboxImg(img)}
                  className="group relative aspect-[3/4] w-full cursor-pointer overflow-hidden border-0 bg-[#eee6d7] p-0 focus:outline-none"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="block h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[#071f1b]/0 transition-colors duration-300 group-hover:bg-[#071f1b]/15" />
                </button>
              ))}
            </div>
          </Reveal>
        </section> */}

        {/* ===================================================================
            8. CLOSING BLESSING SECTION
        =================================================================== */}
        <section className="relative grid min-h-[72svh] place-items-center bg-[#071f1b] px-5 py-20 text-center text-white">
          {/* Inset Gold Border */}
          <div className="pointer-events-none absolute inset-5 border border-[#d0ac67]/30 sm:inset-7" />

          <Reveal className="relative z-10 max-w-[650px] px-4">
            <p dir="rtl" className="font-arabic text-[38px] text-[#e6d19b] sm:text-[42px]">
              بارك الله لكما
            </p>
            <p className="font-serif-editorial mt-2 text-[22px] leading-[1.4] text-white/95 italic sm:text-[25px]">
              May Allah bless your journey
              <br />
              with love, mercy and barakah.
            </p>
            <h2 className="font-serif-editorial mt-9 mb-2 text-[52px] leading-none font-normal italic sm:text-[66px]">
              Jasim <span className="not-italic text-[#d0ac67]">&amp;</span>{' '}
              Fathima
            </h2>
            <p className="text-[9px] font-medium tracking-[0.26em] text-[#dfc48c] uppercase">
              27 · 12 · 2026
            </p>
            <p className="mt-9 text-[10px] leading-[1.8] tracking-[0.12em] text-white/70 uppercase">
              With love &amp; prayers,
              <br />
              <strong className="font-semibold text-white/90">
                THE KITH &amp; KIN OF JASIM &amp; FATHIMA
              </strong>
            </p>
          </Reveal>
        </section>
      </main>

      {/* =====================================================================
          9. FLOATING AUDIO CONTROLLER ("Zariya")
      ===================================================================== */}
      <div className="fixed right-4 bottom-4 z-[80] flex items-center gap-2 rounded-full bg-[#071f1b]/85 py-1.5 pr-3.5 pl-1.5 text-white shadow-lg backdrop-blur-xs sm:right-5 sm:bottom-5">
        <button
          type="button"
          onClick={toggleMusic}
          aria-label={isPlaying ? 'Pause ambient music' : 'Play ambient music'}
          className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[#d0ac67] bg-[#071f1b] text-[14px] text-[#e4c989] transition-transform hover:scale-105 active:scale-95"
        >
          {isPlaying ? '❚❚' : '♪'}
        </button>
        <span className="text-[9px] font-medium tracking-[0.16em] text-white/80 uppercase">
          Zariya
        </span>
      </div>

      {/* Optional Audio Element for Custom MP3 */}
      {ASSETS.musicSrc ? (
        <audio ref={audioRef} loop preload="auto">
          <source src={ASSETS.musicSrc} type="audio/mpeg" />
        </audio>
      ) : null}

      {/* =====================================================================
          LIGHTBOX MODAL FOR GALLERY MEMORIES
      ===================================================================== */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[#061a17]/92 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[88vh] max-w-[90vw] overflow-hidden border border-[#d0ac67]/40 bg-[#071f1b] shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setLightboxImg(null)}
              aria-label="Close image preview"
              className="absolute top-3 right-3 z-10 grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-[#d0ac67]/70 bg-[#071f1b]/80 text-sm text-[#e4c989] hover:bg-[#0b3b32]"
            >
              ✕
            </button>
            <img
              src={lightboxImg.src}
              alt={lightboxImg.alt}
              className="max-h-[85vh] w-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}