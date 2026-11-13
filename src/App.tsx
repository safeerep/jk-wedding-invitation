// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';

const ASSETS = {
  heroDesktop:
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=85',
  heroMobile:
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85',
  memory:
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85',

  galleryExtra:
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=85',
  // Dynamic QR code pointing directly to Emerald Palace Google Maps link
  locationQr:
  ' https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=1b0e2e&bgcolor=ffffff&data=' +
    encodeURIComponent('https://maps.app.goo.gl/zw4HkZ47YxzwsEzU8'),
  // Replace with "/assets/wedding-music.mp3" for your custom track
  musicSrc: '/assets/tu-zariya.mp3',
};

const MAPS_URL = 'https://maps.app.goo.gl/zw4HkZ47YxzwsEzU8';
const WEDDING_DATE_ISO = '2026-12-27T11:00:00+05:30';


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
      } catch (err) {
        console.error("Audio playback failed:", err);
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
    { src: ASSETS.memory, alt: 'Jasim and Fathima — Moment 3' },
  ];

  // 3D Tilt state for the Quranic Blessing Card
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: -y * 14, // Max 7deg tilt vertically
      rotateY: x * 14,  // Max 7deg tilt horizontally
    });
  };

  const handleCardMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden bg-[#faf7fc] text-[#231934] selection:bg-[#1b0e2e] selection:text-[#e2c285]"
      style={{ fontFamily: '"DM Sans", sans-serif' }}
    >
      {/* Custom Styles for Keyframes, 3D Layers & Font Helpers */}
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
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlow 45s linear infinite;
        }
        .perspective-stage {
          perspective: 1200px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>

      {/* Subtle Paper Grain Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-99 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* =====================================================================
          1. INTERACTIVE ENVELOPE / INTRO SPLASH OVERLAY
      ===================================================================== */}
      <div
        className={`fixed inset-0 z-100 grid place-items-center overflow-hidden bg-[#120822] text-white transition-all duration-1000 ${
          isOpened
            ? 'pointer-events-none invisible opacity-0'
            : 'visible opacity-100'
        }`}
      >
        {/* Slow-zooming Hero Background */}
        <div
          className="animate-slow-zoom absolute inset-[-4%] bg-cover bg-position-[center_12%] saturate-75"
          style={{ backgroundImage: `url("${ASSETS.heroDesktop}")` }}
        />
        {/* Royal Plum Gradient Shade */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(24,10,44,0.42) 0%, rgba(15,6,28,0.92) 100%)',
          }}
        />
        {/* Ambient Violet Glow */}
        <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-[#7c3aed]/20 blur-[120px]" />

        {/* Concentric Champagne Gold Ring */}
        <div className="pointer-events-none absolute h-[108vw] w-[108vw] max-h-200 max-w-200 rounded-full border border-[#d9b46f]/40 shadow-[0_0_0_30px_rgba(217,180,111,0.03)] sm:h-[74vw] sm:w-[74vw]" />

        {/* Intro Content */}
        <div className="relative z-10 px-6 text-center">
          <p className="font-arabic text-[22px] text-[#f0dca8] sm:text-[25px]">
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
          </p>
          <p className="mt-2 text-[9px] font-semibold tracking-[0.28em] text-purple-100/85 uppercase">
            A WEDDING INVITATION
          </p>
          <h1 className="font-serif-editorial my-4 text-[56px] leading-[0.84] font-normal italic sm:text-[76px]">
            Jasim{' '}
            <span className="not-italic text-[0.55em] text-[#d9b46f]">
              &amp;
            </span>{' '}
            Fathima
          </h1>
          <p className="font-arabic text-[26px] text-[#ebd49d] sm:text-[29px]">
            جاسم &amp; فاطمة رنزي
          </p>

          <button
            type="button"
            onClick={handleOpenInvitation}
            className="mt-7 inline-flex cursor-pointer items-center rounded-full border border-[#d9b46f]/75 bg-[#1b0e2e]/65 px-8 py-3.5 text-[10px] font-semibold tracking-[0.18em] text-white uppercase shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-300 hover:border-[#e6c786] hover:bg-[#311954] active:scale-95"
          >
            Open Invitation
            <span className="ml-2.5 text-sm leading-none text-[#d9b46f]">
              →
            </span>
          </button>
        </div>

        {/* Bottom Gold Ornament */}
        <div className="absolute bottom-7 text-[25px] text-[#d9b46f]">✦</div>
      </div>

      {/* =====================================================================
          MAIN INVITATION CONTENT
      ===================================================================== */}
      <main id="page">
        {/* ===================================================================
            2. HERO SECTION
        =================================================================== */}
        <section className="relative grid h-svh min-h-165 w-full place-items-center overflow-hidden text-center text-white">
          {/* Desktop Background */}
          <div
            className="animate-slow-zoom absolute inset-0 hidden bg-cover bg-position-[center_12%] sm:block"
            style={{ backgroundImage: `url("${ASSETS.heroDesktop}")` }}
          />
          {/* Mobile Background */}
          <div
            className="animate-slow-zoom absolute inset-0 block bg-cover bg-top sm:hidden"
            style={{ backgroundImage: `url("${ASSETS.heroMobile}")` }}
          />
          {/* Atmospheric Plum Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(22,10,40,0.36) 0%, rgba(26,12,46,0.48) 45%, rgba(16,7,30,0.94) 100%)',
            }}
          />

          {/* Hero Inner Frame */}
          <div className="relative z-10 flex h-full w-full max-w-245 flex-col items-center justify-between px-5 pt-[7vh] pb-[13vh]">
            {/* Top Bismillah & Subtitle */}
            <div className="flex flex-col items-center gap-2">
              <p className="font-arabic m-0 text-[21px] text-[#edd79b] sm:text-[26px]">
                بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
              </p>
              <p className="m-0 text-[8px] font-semibold tracking-[0.26em] text-purple-100/90 uppercase sm:text-[9px] sm:tracking-[0.30em]">
                FROM THEIR KITH &amp; KIN
              </p>
            </div>

            {/* Center Couple Title & Date */}
            <div className="mt-[-1vh] flex flex-col items-center justify-center">
              <h2 className="font-serif-editorial m-0 text-[clamp(52px,14vw,98px)] leading-[0.84] font-normal italic sm:whitespace-nowrap">
                Jasim{' '}
                <span className="not-italic text-[0.58em] text-[#d9b46f]">
                  &amp;
                </span>{' '}
                Fathima
              </h2>
              <p className="font-arabic mt-4 mb-2 text-[25px] text-[#ebd397] sm:text-[31px]">
                جاسم &amp; فاطمة رنزي
              </p>
              <p className="m-0 text-[10px] font-medium tracking-[0.28em] text-[#e7cf93] uppercase">
                27 · DECEMBER · 2026
              </p>

              {/* Gold Diamond Ornament Divider */}
              <div className="my-2.5 flex h-8 w-37.5 items-center justify-center gap-2.5 text-[#d9b46f] sm:w-[175px]">
                <span className="h-px w-13 bg-[#d9b46f]/65 sm:w-16.25" />
                <span className="text-xs">✦</span>
                <span className="h-px w-13 bg-[#d9b46f]/65 sm:w-16.25" />
              </div>

              <p className="font-serif-editorial m-0 text-[21px] leading-tight text-white italic drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)] sm:text-[24px]">
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
                className="mb-0.5 h-px w-27.5 sm:w-32.5"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(217,180,111,0.75), transparent)',
                }}
              />
              <span className="text-[8px] font-semibold tracking-[0.22em] whitespace-nowrap uppercase drop-shadow-[0_1px_10px_rgba(0,0,0,0.85)] sm:text-[9px] sm:tracking-[0.25em]">
                SWIPE UP TO EXPLORE
              </span>
              <span className="block text-[30px] leading-[0.6] text-[#d9b46f] drop-shadow-[0_1px_10px_rgba(0,0,0,0.85)]">
                ⌄
              </span>
            </a>
          </div>
        </section>

        {/* ===================================================================
            3. THE INVITATION & FAMILY LINEAGE SECTION
        =================================================================== */}
        <section id="invitation" className="px-[7vw] py-24 sm:py-28">
          <Reveal className="mx-auto max-w-262.5">
            <p className="text-[9px] font-semibold tracking-[0.28em] text-[#7c5394] uppercase">
              THE INVITATION
            </p>
            <h2 className="font-serif-editorial mt-2 mb-7 text-[clamp(48px,7vw,80px)] leading-[0.86] font-medium text-[#1b0e2e]">
              With love,
              <br />
              <em className="font-normal text-[#8e5da8]">we invite you.</em>
            </h2>
            <p className="max-w-142.5 text-[15px] leading-[1.75] text-[#665b75]">
              With the blessings of their families, we, their{' '}
              <strong className="font-semibold text-[#1b0e2e]">
                kith and kin
              </strong>
              ,
              <br className="hidden sm:inline" /> cordially invite you to share
              in their joyous celebration.
            </p>

            {/* Modern Glassmorphic Couple & Family Card */}
            <div className="my-10 grid max-w-205 grid-cols-1 items-center gap-6 rounded-3xl border border-[#e3d8ee] bg-white/80 px-6 py-9 text-center shadow-[0_20px_50px_rgba(44,20,76,0.05)] backdrop-blur-sm sm:grid-cols-[1fr_54px_1fr] sm:gap-2">
              <div className="px-2">
                <strong className="font-serif-editorial block text-[26px] leading-tight font-medium tracking-[0.04em] text-[#1b0e2e] sm:text-[28px]">
                  JASIM KARIMBUMKANDATHIL
                </strong>
                <span className="font-serif-editorial mt-1.5 block text-[17px] leading-[1.4] text-[#665b75]">
                  S/o Mujeeb Rahman &amp; Raheena
                </span>
                <small className="mt-1.5 block text-[12px] leading-[1.55] text-[#7e728f]">
                  Karimbumkandathil House
                </small>
              </div>

              <div className="font-serif-editorial text-[36px] text-[#c59b52] italic">
                &amp;
              </div>

              <div className="px-2">
                <strong className="font-serif-editorial block text-[26px] leading-tight font-medium tracking-[0.04em] text-[#1b0e2e] sm:text-[28px]">
                  FATHIMA RINZI
                </strong>
                <span className="font-serif-editorial mt-1.5 block text-[17px] leading-[1.4] text-[#665b75]">
                  D/o Asainar &amp; Rukhiya
                </span>
                <small className="mt-1.5 block text-[12px] leading-[1.55] text-[#7e728f]">
                  VV
                </small>
              </div>
            </div>

            <p className="max-w-142.5 text-[15px] leading-[1.75] text-[#665b75]">
              We request the pleasure of your gracious presence and blessings as
              they begin this beautiful journey together.
            </p>
          </Reveal>
        </section>

        {/* ===================================================================
            4. 3D LAYERED QURANIC BLESSING SECTION
        =================================================================== */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#170b29] via-[#23103d] to-[#140924] px-6 py-28 text-center text-white sm:py-36">
          {/* Ambient Purple Orbs in Deep Background */}
          <div className="pointer-events-none absolute top-1/4 -left-24 h-80 w-80 rounded-full bg-[#6d28d9]/25 blur-[110px]" />
          <div className="pointer-events-none absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-[#a855f7]/20 blur-[110px]" />

          <Reveal className="perspective-stage mx-auto max-w-[920px]">
            {/* Interactive 3D Tilting Container */}
            <div
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              style={{
                transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                transition:
                  tilt.rotateX === 0 && tilt.rotateY === 0
                    ? 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
                    : 'transform 0.1s ease-out',
              }}
              className="preserve-3d relative mx-auto rounded-3xl border border-[#d9b46f]/30 bg-white/[0.04] px-6 py-16 shadow-[0_35px_90px_rgba(6,2,14,0.65)] backdrop-blur-md sm:px-14 sm:py-22"
            >
              {/* Layer 1 (Z: 15px): Rotating Sacred Geometry Watermark */}
              <div
                style={{ transform: 'translateZ(15px)' }}
                className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-3xl opacity-15"
              >
                <svg
                  viewBox="0 0 200 200"
                  className="animate-spin-slow h-[340px] w-[340px] text-[#d9b46f] sm:h-[440px] sm:w-[440px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.6"
                >
                  <rect x="35" y="35" width="130" height="130" />
                  <rect
                    x="35"
                    y="35"
                    width="130"
                    height="130"
                    transform="rotate(45 100 100)"
                  />
                  <circle cx="100" cy="100" r="92" />
                  <circle cx="100" cy="100" r="65" />
                </svg>
              </div>

              {/* Layer 2 (Z: 28px): Floating Inner Gold Frame */}
              <div
                style={{ transform: 'translateZ(28px)' }}
                className="pointer-events-none absolute inset-4 rounded-2xl border border-[#d9b46f]/35 shadow-[inset_0_0_30px_rgba(217,180,111,0.06)] sm:inset-6"
              />

              {/* Layer 3 (Z: 45px): Header & Quote Ornament */}
              <div style={{ transform: 'translateZ(45px)' }}>
                <p className="text-[9px] font-semibold tracking-[0.28em] text-[#e2c88b] uppercase">
                  A BLESSING FOR TWO
                </p>
                <div className="font-serif-editorial mt-2 h-[54px] text-[96px] leading-none text-[#d9b46f] drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
                  “
                </div>
              </div>

              {/* Layer 4 (Z: 68px - Highest Elevation): Quranic Verse */}
              <div style={{ transform: 'translateZ(68px)' }}>
                <p
                  dir="rtl"
                  className="font-arabic mt-5 mb-3 text-[40px] leading-relaxed text-[#f5e4b5] drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)] sm:text-[52px]"
                >
                  وَخَلَقْنَاكُمْ أَزْوَاجًا
                </p>
                <p className="font-serif-editorial mb-6 text-[30px] leading-snug italic text-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)] sm:text-[40px]">
                  “And We created you in pairs.”
                </p>
              </div>

              {/* Layer 5 (Z: 38px): Surah Reference Pill */}
              <div style={{ transform: 'translateZ(38px)' }}>
                <span className="inline-block rounded-full border border-[#d9b46f]/30 bg-[#1b0e2e]/60 px-4 py-1.5 text-[9px] font-medium tracking-[0.25em] text-[#dfd0a2] uppercase">
                  THE QUR’AN · 78:8
                </span>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ===================================================================
            5. SAVE THE DATE & LIVE COUNTDOWN SECTION
        =================================================================== */}
        <section className="bg-[#f1ebf7] px-[7vw] py-24 sm:py-28">
          <Reveal className="mx-auto max-w-[1050px]">
            <p className="mb-5 text-[9px] font-semibold tracking-[0.28em] text-[#7c5394] uppercase">
              SAVE THE DATE
            </p>

            {/* Elevated White & Royal Plum Event Card */}
            <div className="grid max-w-[950px] grid-cols-1 overflow-hidden rounded-3xl border border-[#e3d8ee] bg-white shadow-[0_25px_65px_rgba(38,18,66,0.08)] md:grid-cols-[280px_1fr]">
              {/* Left Royal Plum Date Card */}
              <div className="flex min-h-[240px] flex-col items-center justify-center bg-gradient-to-br from-[#271344] to-[#150926] py-10 text-white md:min-h-[350px]">
                <span className="text-[9px] font-medium tracking-[0.25em] text-[#e7d197] uppercase">
                  SUNDAY
                </span>
                <strong className="font-serif-editorial my-2 text-[96px] leading-[0.82] font-normal sm:text-[112px]">
                  27
                </strong>
                <small className="text-[9px] font-medium tracking-[0.25em] text-[#e7d197] uppercase">
                  DECEMBER 2026
                </small>
              </div>

              {/* Right Event Details */}
              <div className="p-8 sm:p-12 md:p-14">
                <h2 className="font-serif-editorial mt-1 mb-6 text-[52px] leading-[0.84] font-medium text-[#1b0e2e] sm:text-[66px]">
                  Wedding
                  <br />
                  <em className="font-normal text-[#8e5da8]">Celebration</em>
                </h2>
                <p className="text-[11px] font-semibold tracking-[0.16em] text-[#7c5394] uppercase">
                  11:00 AM - 3:00 PM
                </p>
                <p className="mt-3 text-[15px] leading-[1.7] text-[#665b75]">
                  <strong className="font-semibold text-[#1b0e2e]">
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
                    className="inline-flex items-center justify-center rounded-full bg-[#1b0e2e] px-6 py-3.5 text-[10px] font-semibold tracking-[0.1em] text-white uppercase no-underline transition-all hover:bg-[#321954] hover:shadow-lg"
                  >
                    Get Directions ↗
                  </a>
                  <button
                    type="button"
                    onClick={handleDownloadCalendar}
                    className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#dccfe8] bg-[#f5effa] px-6 py-3.5 text-[10px] font-semibold tracking-[0.1em] text-[#1b0e2e] uppercase transition-colors hover:bg-[#eae0f4]"
                  >
                    Add to Calendar
                  </button>
                </div>
              </div>
            </div>

            {/* Live Countdown Timer */}
            <div className="mt-16">
              <p className="mb-4 text-[9px] font-semibold tracking-[0.28em] text-[#7c5394] uppercase">
                COUNTING DOWN TO THE DAY
              </p>
              <div className="grid max-w-[850px] grid-cols-4 overflow-hidden rounded-2xl border border-[#dfd3eb] bg-white/70 backdrop-blur-xs">
                {[
                  { label: 'DAYS', value: timeLeft.days },
                  { label: 'HOURS', value: timeLeft.hours },
                  { label: 'MINUTES', value: timeLeft.minutes },
                  { label: 'SECONDS', value: timeLeft.seconds },
                ].map((item, idx) => (
                  <div
                    key={item.label}
                    className={`py-5 text-center sm:py-6 ${
                      idx < 3 ? 'border-r border-[#dfd3eb]' : ''
                    }`}
                  >
                    <strong className="font-serif-editorial block text-[40px] leading-none font-normal text-[#4b276e] sm:text-[56px]">
                      {item.value}
                    </strong>
                    <span className="mt-2 block text-[8px] font-medium tracking-[0.18em] text-[#665b75] uppercase">
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
            <p className="text-[9px] font-semibold tracking-[0.28em] text-[#7c5394] uppercase">
              THE LOCATION
            </p>
            <h2 className="font-serif-editorial mt-2 mb-5 text-[clamp(46px,6vw,78px)] leading-[0.86] font-medium text-[#1b0e2e]">
              Find us at
              <br />
              <em className="font-normal text-[#8e5da8]">Emerald Palace</em>
            </h2>
            <p className="mb-3 text-[15px] text-[#665b75]">Kurukkol, Kerala</p>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-8 inline-block text-[11px] font-semibold tracking-[0.06em] text-[#1b0e2e] underline-offset-4 hover:underline"
            >
              Open Google Maps ↗
            </a>

            {/* Styled QR Card */}
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Scan or click QR code for Google Maps directions"
              className="block w-[182px] rounded-2xl border border-[#e3d8ee] bg-white p-4 shadow-[0_14px_35px_rgba(38,18,66,0.07)] transition-transform duration-300 hover:-translate-y-1"
            >
              <img
                src={ASSETS.locationQr}
                alt="QR code for Emerald Palace location"
                className="block h-auto w-full rounded-lg"
              />
              <span className="mt-2.5 block text-center text-[7.5px] font-semibold tracking-[0.16em] text-[#7c5394] uppercase">
                SCAN FOR DIRECTIONS
              </span>
            </a>
          </Reveal>
        </section>

        {/* ===================================================================
            8. CLOSING BLESSING SECTION
        =================================================================== */}
        <section className="relative grid min-h-[72svh] place-items-center overflow-hidden bg-gradient-to-b from-[#1a0c2e] to-[#10061f] px-5 py-20 text-center text-white">
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-[#7e22ce]/20 blur-[120px]" />

          {/* Inset Gold Border */}
          <div className="pointer-events-none absolute inset-5 rounded-3xl border border-[#d9b46f]/25 sm:inset-7" />

          <Reveal className="relative z-10 max-w-[650px] px-4">
            <p
              dir="rtl"
              className="font-arabic text-[38px] text-[#edd89e] sm:text-[42px]"
            >
              بارك الله لكما
            </p>
            <p className="font-serif-editorial mt-2 text-[22px] leading-[1.4] text-purple-50/95 italic sm:text-[25px]">
              May Allah bless your journey
              <br />
              with love, mercy and barakah.
            </p>
            <h2 className="font-serif-editorial mt-9 mb-2 text-[52px] leading-none font-normal italic sm:text-[66px]">
              Jasim <span className="not-italic text-[#d9b46f]">&amp;</span>{' '}
              Fathima
            </h2>
            <p className="text-[9px] font-medium tracking-[0.26em] text-[#e4c98e] uppercase">
              27 · 12 · 2026
            </p>
            <p className="mt-9 text-[10px] leading-[1.8] tracking-[0.12em] text-purple-200/70 uppercase">
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
      <div className="fixed right-4 bottom-4 z-[80] flex items-center gap-2 rounded-full border border-[#d9b46f]/30 bg-[#1b0e2e]/85 py-1.5 pr-4 pl-1.5 text-white shadow-xl backdrop-blur-md sm:right-5 sm:bottom-5">
        <button
          type="button"
          onClick={toggleMusic}
          aria-label={isPlaying ? 'Pause ambient music' : 'Play ambient music'}
          className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[#d9b46f] bg-[#2a1647] text-[14px] text-[#ebd194] transition-transform hover:scale-105 active:scale-95"
        >
          {isPlaying ? '❚❚' : '♪'}
        </button>
        <span className="text-[9px] font-medium tracking-[0.16em] text-purple-100/85 uppercase">
          Zariya
        </span>
      </div>

      {/* Optional Audio Element for Custom MP3 */}
      {ASSETS.musicSrc ? (
        <audio ref={audioRef} src={ASSETS.musicSrc} loop preload="auto" />
      ) : null}

      {/* =====================================================================
          LIGHTBOX MODAL FOR GALLERY MEMORIES
      ===================================================================== */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[#120822]/92 p-4 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[88vh] max-w-[90vw] overflow-hidden rounded-2xl border border-[#d9b46f]/40 bg-[#1b0e2e] shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setLightboxImg(null)}
              aria-label="Close image preview"
              className="absolute top-3 right-3 z-10 grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-[#d9b46f]/70 bg-[#1b0e2e]/80 text-sm text-[#ebd194] hover:bg-[#321954]"
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