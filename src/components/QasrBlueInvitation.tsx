import { useEffect, useState, type CSSProperties, type FormEvent } from 'react'

/* ------------------------------------------------------------------ */
/* Theme                                                               */
/* ------------------------------------------------------------------ */

// Decorative images. Place the theme's .webp files in public/images/themes/qasr-blue/
const IMG = '/images/themes/qasr-blue'

const BROWN = '#72614b' // rgb(114, 97, 75)
const BLUE = '#5e7e9b' // rgb(94, 126, 155)
const CREAM = '#f8f3e7' // rgb(248, 243, 231)

const FONT = {
    display: '"Viaoda Libre", "EB Garamond", serif',
    script: '"Alex Brush", "Great Vibes", cursive',
    scriptAlt: '"Ms Madi", "Alex Brush", cursive',
    times: '"Times New Roman", Times, serif',
    body: 'Baskerville, "Libre Baskerville", "Times New Roman", serif',
    cormorant: '"Cormorant Garamond", "Times New Roman", serif',
    garamond: '"EB Garamond", serif',
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const WEDDING = {
    shortNames: ['Jk', 'Rinzi'] as const,
    groom: 'Muhamad Jasim K K',
    bride: 'Fathima Rinzi V V',
    families: [
        { parents: ['Mr. Mujeeb Rahman K K', 'Mrs. Raheena KP'], address: 'Karimbumkandathil House, Mayyerichira' },
        { parents: ['Mr. Assainar V V', 'Mrs. Sulaikha MP'], address: 'ValiyaValappil House, Cheravannur' },
    ],
    // 27 Dec 2026, 11:00 IST
    date: new Date('2026-12-27T11:00:00+05:30'),
    time: '11:00',
    weekday: 'SUNDAY',
    venue: 'Amanath Convention Centre',
    schedule: [
        { label: 'Welcome', icon: 'cake.webp' },
        { label: 'Main Course', icon: 'opening.webp' },
        { label: 'Photoshoot', icon: 'ring.webp' },
        { label: 'Farewell', icon: null },
    ],
}

const enc = encodeURIComponent
const CALENDAR_URL =
    'https://www.google.com/calendar/render?action=TEMPLATE' +
    `&text=${enc(`${WEDDING.groom} & ${WEDDING.bride}'s Wedding Celebration`)}` +
    '&dates=20261227T053000Z/20261227T073000Z&ctz=Asia/Calcutta' +
    `&details=${enc(`Join us to celebrate the marriage of ${WEDDING.groom} & ${WEDDING.bride} at ${WEDDING.venue}`)}` +
    `&location=${enc(WEDDING.venue)}`
const MAP_EMBED_URL = `https://maps.google.com/maps?q=${enc(WEDDING.venue)}&output=embed`
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${enc(WEDDING.venue)}`

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function Deco({ src, className = '', style }: { src: string; className?: string; style?: CSSProperties }) {
    return (
        <img
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            src={`${IMG}/${src}`}
            className={`pointer-events-none absolute h-auto max-w-none object-contain ${className}`}
            style={style}
        />
    )
}

function HouseBackground({ offset }: { offset: string }) {
    return (
        <Deco
            src="house-background.webp"
            className="left-[-56.46%] top-0 w-[213.15%] opacity-40 -z-10"
            style={{ transform: `translateY(${offset})` }}
        />
    )
}

function SectionTitle({ children, as: Tag = 'h2' }: { children: string; as?: 'h2' | 'h3' }) {
    return (
        <Tag
            className={`font-bold text-center uppercase ${Tag === 'h2' ? 'text-[20px] md:text-[26px]' : 'text-[18px] md:text-[24px]'}`}
            style={{ color: BROWN, fontFamily: FONT.times }}
        >
            {children}
        </Tag>
    )
}

function useCountdown(target: Date) {
    const [now, setNow] = useState(() => Date.now())
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(id)
    }, [])
    const diff = Math.max(0, target.getTime() - now)
    const s = Math.floor(diff / 1000)
    return {
        days: Math.floor(s / 86400),
        hours: Math.floor((s % 86400) / 3600),
        minutes: Math.floor((s % 3600) / 60),
        seconds: s % 60,
        done: diff === 0,
    }
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function Hero() {
    const [a, b] = WEDDING.shortNames
    const nameStyle = { fontFamily: FONT.display, color: BLUE, fontSize: 35 }
    return (
        <section className="relative isolate w-full aspect-[441/799]">
            <HouseBackground offset="-2.41%" />
            <Deco src="curtain-decoration.webp" className="left-[-24.04%] top-[-27.66%] w-[147.85%] z-[2]" />
            <Deco src="wallframe-decoration.webp" className="left-[-7%] top-[-1%] w-[114.74%] z-0" />
            <Deco src="house2-decoration.webp" className="left-1/2 -translate-x-1/2 top-[23.9%] w-[143.08%] z-[1]" />
            <Deco src="lamp-decoration.webp" className="left-[10.2%] top-[-0.38%] w-[10.2%] z-[3]" />
            <Deco src="lamp-decoration.webp" className="left-[76.64%] top-[-0.38%] w-[10.2%] z-[3]" />
            <Deco src="flower-decoration.webp" className="left-[-7.48%] top-[-8.51%] w-[34.69%] z-[4]" />
            <Deco src="flower-decoration.webp" className="left-[74.38%] top-[-8.51%] w-[34.69%] -scale-x-100 z-[4]" />

            <p
                className="absolute left-1/2 top-[14.14%] -translate-x-1/2 z-20 w-[56%] text-center text-[10px] md:text-[13px] uppercase text-balance leading-snug"
                style={{ color: BROWN, letterSpacing: '0.04em' }}
            >
                Welcome to our wedding
            </p>
            <div className="absolute left-1/2 top-[22.03%] -translate-x-1/2 z-20 flex w-[72%] max-w-[330px] md:max-w-[560px] flex-col items-center text-center leading-none">
                <span className="whitespace-nowrap uppercase" style={nameStyle}>{a}</span>
                <span className="my-[0.1em]" style={{ fontFamily: FONT.script, color: BROWN, fontSize: 30 }}>&amp;</span>
                <span className="whitespace-nowrap uppercase" style={nameStyle}>{b}</span>
            </div>
        </section>
    )
}

function Couple() {
    const coupleName = (name: string, role: string) => (
        <>
            <h3
                className="w-[80%] min-h-[80px] flex items-center justify-center leading-[44px] md:leading-[62px] whitespace-nowrap"
                style={{ fontSize: 31, fontFamily: FONT.display, color: BROWN }}
            >
                {name}
            </h3>
            <div className="text-xs uppercase" style={{ color: BLUE, fontFamily: FONT.cormorant, letterSpacing: '0.1em' }}>
                {role}
            </div>
        </>
    )

    const family = (f: (typeof WEDDING.families)[number]) => (
        <div className="row-span-4 grid grid-rows-subgrid justify-items-center justify-self-center min-w-0 text-center max-w-[169px] md:max-w-[300px]">
            <span className="text-[12px] md:text-[16px] mb-1" />
            {f.parents.map((p) => (
                <span key={p} className="font-semibold [overflow-wrap:anywhere]" style={{ fontSize: 12 }}>
                    {p}
                </span>
            ))}
            <div className="[overflow-wrap:anywhere] text-[10px] md:text-[13px] mt-2 leading-snug" style={{ color: BLUE }}>
                {f.address}
            </div>
        </div>
    )

    return (
        <section className="relative isolate px-[37px] md:px-[64px] pt-[12px] md:pt-[24px] pb-[20px] md:pb-[40px] z-10">
            <HouseBackground offset="-6.67%" />
            <Deco src="frame-decoration.webp" className="left-[-2.49%] top-[-90px] md:top-[-243px] w-[104.54%] z-[1]" />
            <Deco src="archframe1-decoration.webp" className="z-[1] top-[-91px] md:top-[-186px]" style={{ left: '-16.55%', width: '41.27%' }} />
            <Deco src="archframe1-decoration.webp" className="-scale-x-100 z-[1] top-[-91px] md:top-[-186px]" style={{ left: '75.28%', width: '41.27%' }} />
            <Deco src="flower-decoration.webp" className="z-[1] top-[-156px] md:top-[-318px]" style={{ left: '-6.35%', width: '34.69%' }} />
            <Deco src="flower-decoration.webp" className="-scale-x-100 z-[1] top-[-156px] md:top-[-318px]" style={{ left: '71.66%', width: '34.69%' }} />
            <Deco src="tree-decoration.webp" className="z-[1] bottom-[120px] md:bottom-[245px]" style={{ left: '-25.4%', width: '52.15%' }} />
            <Deco src="tree-decoration.webp" className="-scale-x-100 z-[1] bottom-[120px] md:bottom-[245px]" style={{ left: '73.25%', width: '52.15%' }} />

            <div className="relative z-10 flex flex-col items-center gap-5 md:gap-7">
                <SectionTitle>Wedding Info</SectionTitle>

                <div
                    className="w-full grid grid-cols-[1fr_auto_1fr] justify-center gap-x-3 md:gap-x-6 grid-rows-[repeat(4,auto)] gap-y-1"
                    style={{ color: BROWN, fontFamily: FONT.body }}
                >
                    {family(WEDDING.families[0])}
                    <img
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        src={`${IMG}/line-decoration.webp`}
                        className="row-span-4 self-center h-[51px] md:h-[72px] w-auto object-contain"
                    />
                    {family(WEDDING.families[1])}
                </div>

                <div
                    className="relative text-center text-[16px] md:text-[20px] flex flex-col gap-1 mx-auto md:max-w-[560px]"
                    style={{ fontFamily: FONT.body, color: BROWN }}
                >
                    WE JOYFULLY ANNOUNCE
                    <br />
                    THE WEDDING OF OUR CHILDREN
                </div>

                <div className="w-full min-w-0 relative flex flex-col items-center text-center gap-3 md:gap-4">
                    {coupleName(WEDDING.groom, 'Groom')}
                    <div className="text-[35px] md:text-[48px] leading-none" style={{ color: BROWN, fontFamily: FONT.scriptAlt }}>
                        &amp;
                    </div>
                    {coupleName(WEDDING.bride, 'Bride')}
                </div>

                <img
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    src={`${IMG}/goldenline-decoration.webp`}
                    className="mx-auto block h-auto w-[43.5%] max-w-[192px] md:max-w-[260px] object-contain mt-7 md:mt-9"
                />
            </div>
        </section>
    )
}

function MonthCalendar({ date }: { date: Date }) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const highlight = date.getDate()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const leading = (new Date(year, month, 1).getDay() + 6) % 7 // Monday-first
    const cells = [...Array(leading).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
    const title = date.toLocaleString('en-US', { month: 'long', year: 'numeric' })

    return (
        <div className="w-full mx-auto rounded-lg overflow-hidden" style={{ color: BROWN }}>
            <div
                className="text-center py-2.5 text-[15px] md:text-[19px] font-bold tracking-wide border-b"
                style={{ borderColor: `color-mix(in srgb, ${BROWN} 27%, transparent)`, fontFamily: FONT.times }}
            >
                {title}
            </div>
            <div className="grid grid-cols-7 border-b-2" style={{ borderColor: BROWN }}>
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                    <div key={d} className="text-center py-1.5 text-[10px] md:text-[11px] font-medium opacity-60">
                        {d}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5 px-1 py-2">
                {cells.map((day, i) => (
                    <div key={i} className="flex items-center justify-center h-[30px] md:h-[34px]">
                        {day === highlight ? (
                            <div className="relative w-[26px] h-[24px] md:w-[30px] md:h-[28px] flex items-center justify-center">
                                <img alt="" aria-hidden="true" src={`${IMG}/heart.webp`} className="absolute inset-0 w-full h-full object-contain" />
                                <span className="relative z-10 text-[11px] md:text-[12px] font-bold text-white">{day}</span>
                            </div>
                        ) : (
                            day && <span className="text-[12px] md:text-[13px]">{day}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

function Countdown() {
    const { days, hours, minutes, seconds, done } = useCountdown(WEDDING.date)
    return (
        <div className="flex items-center justify-center flex-col mt-4">
            <h2 className="text-[15px] md:text-[18px] uppercase" style={{ fontFamily: FONT.body, color: BLUE }}>
                Countdown
            </h2>
            <p className="text-center mt-2 text-[15px] md:text-[18px] font-semibold" style={{ color: BLUE, fontFamily: FONT.body }}>
                {done ? 'Today is the day!' : `${days} days ${hours} hours ${minutes} min ${seconds} sec`}
            </p>
        </div>
    )
}

function Details() {
    const [rsvpSent, setRsvpSent] = useState(false)
    const day = WEDDING.date.getDate()
    const month = WEDDING.date.toLocaleString('en-US', { month: 'long' }).toUpperCase()
    const year = WEDDING.date.getFullYear()

    return (
        <section className="relative isolate px-[18px] md:px-[36px] pt-[34px] md:pt-[60px] z-10">
            <HouseBackground offset="-25.67%" />
            <Deco src="archframe2-decoration.webp" className="z-[1] top-[-46px] md:top-[-94px]" style={{ left: '-21.09%', width: '41.04%' }} />
            <Deco src="archframe2-decoration.webp" className="-scale-x-100 z-[1] top-[-46px] md:top-[-94px]" style={{ left: '80.05%', width: '41.04%' }} />
            <Deco src="flower3-decoration.webp" className="z-[1] top-[275px] md:top-[480px]" style={{ left: '-9.98%', width: '27.21%' }} />
            <Deco src="flower3-decoration.webp" className="-scale-x-100 z-[1] top-[275px] md:top-[480px]" style={{ left: '82.77%', width: '27.21%' }} />

            <div className="relative z-10 w-full flex flex-col items-center">
                <SectionTitle>Wedding Info</SectionTitle>

                <div
                    className="relative mt-6 md:mt-8 flex w-full flex-col items-center gap-5 md:gap-7 text-center"
                    style={{ fontFamily: FONT.body, color: BLUE }}
                >
                    <h3 className="text-[16px] md:text-[20px] uppercase text-balance font-semibold" style={{ color: BROWN }}>
                        The celebration will take place&nbsp;at:
                    </h3>

                    <div className="flex w-full max-w-[165px] md:max-w-[230px] items-center justify-between text-[15px] md:text-[18px] uppercase font-semibold whitespace-nowrap min-w-max gap-x-3">
                        <span>{WEDDING.weekday}</span>
                        <span>{WEDDING.time}</span>
                    </div>

                    <div className="flex items-center gap-6" style={{ color: BROWN, fontFamily: FONT.times }}>
                        <span className="text-[57px] md:text-[76px] leading-none" style={{ fontFamily: FONT.body }}>
                            {day}
                        </span>
                        <div className="w-px h-[46px] md:h-[62px] opacity-60" style={{ backgroundColor: BROWN }} />
                        <div className="flex flex-col items-start justify-center gap-1 text-left text-[17px] md:text-[22px] uppercase">
                            <span>{month}</span>
                            <span>{year}</span>
                        </div>
                    </div>

                    <Countdown />

                    <div className="relative mx-auto mt-7 md:mt-9 w-full max-w-[270px] md:max-w-[350px] py-4 md:py-6">
                        <img
                            aria-hidden="true"
                            alt=""
                            src={`${IMG}/calendar-frame.webp`}
                            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-auto max-w-none z-0"
                            style={{ width: 'calc(100% + 112px)' }}
                        />
                        <div className="relative z-[1]">
                            <MonthCalendar date={WEDDING.date} />
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex justify-center">
                    <a
                        href={CALENDAR_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center text-[13px] md:text-[16px] underline underline-offset-4 decoration-1 transition-opacity hover:opacity-70"
                        style={{ color: BLUE, fontFamily: FONT.times }}
                    >
                        Add to Calendar
                    </a>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center w-full mt-7 md:mt-9">
                    <button
                        type="button"
                        onClick={() => setRsvpSent(true)}
                        disabled={rsvpSent}
                        className="text-[13px] md:text-base inline-flex items-center justify-center rounded-full px-7 py-2 text-white transition-transform hover:scale-[1.03] disabled:hover:scale-100"
                        style={{ backgroundColor: BLUE, fontFamily: FONT.body }}
                    >
                        {rsvpSent ? 'THANK YOU!' : 'CONFIRM ATTENDANCE'}
                    </button>
                </div>
            </div>
        </section>
    )
}

function Venue() {
    return (
        <div className="relative isolate pt-9 md:pt-12 z-10">
            <div className="relative z-10 flex w-full flex-col items-center">
                <section className="relative flex w-full flex-col gap-3 md:gap-4 px-6 md:px-10">
                    <div className="relative text-center">
                        <SectionTitle as="h3">Celebration Party&nbsp;Venue</SectionTitle>
                        <div
                            className="mx-auto max-w-sm md:max-w-[500px] text-center text-[12px] md:text-[15px]"
                            style={{ color: BLUE, fontFamily: FONT.body }}
                        >
                            {WEDDING.venue}
                        </div>
                    </div>
                    <div className="relative flex flex-col items-center gap-4 md:gap-5 w-full">
                        <iframe
                            title={`Map of ${WEDDING.venue}`}
                            className="w-full max-w-[338px] md:max-w-[640px] mt-2 rounded-[15px] aspect-[338/267] overflow-hidden border-0"
                            src={MAP_EMBED_URL}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                        <a
                            href={DIRECTIONS_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm md:text-base font-semibold transition-transform hover:scale-[1.03]"
                            style={{ color: BLUE, fontFamily: FONT.body }}
                        >
                            <svg
                                className="h-4 w-4 shrink-0"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <polygon points="3 11 22 2 13 21 11 13 3 11" />
                            </svg>
                            <span>Get directions</span>
                        </a>
                    </div>
                </section>
                <img
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    src={`${IMG}/goldenline-decoration.webp`}
                    className="mx-auto block h-auto w-[43.5%] max-w-[192px] md:max-w-[260px] object-contain mt-6 md:mt-8"
                />
            </div>
        </div>
    )
}

function Schedule() {
    const line = `color-mix(in srgb, ${BROWN} 40%, transparent)`
    const last = WEDDING.schedule.length - 1

    return (
        <>
            <div className="relative isolate pt-6 md:pt-8 z-10">
                <Deco src="flower-decoration.webp" className="top-[-63px] md:top-[-129px] w-[34.69%] z-[1]" style={{ left: '-12.02%' }} />
            </div>
            <div className="relative isolate z-10">
                <HouseBackground offset="-22.27%" />
                <Deco
                    src="flower-decoration.webp"
                    className="top-[64px] md:top-[131px] w-[34.69%] -scale-x-100 z-[1]"
                    style={{ left: '79.14%' }}
                />
                <div className="relative z-10 flex flex-col items-center gap-4 md:gap-6 px-6 md:px-10 pt-9 md:pt-12 pb-8 md:pb-10">
                    <SectionTitle>Celebration Day&nbsp;Schedule</SectionTitle>
                    <ol
                        className="relative mx-auto grid w-full max-w-[460px] grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)] items-center gap-x-6 md:gap-x-8 gap-y-8 md:gap-y-10 py-3"
                        style={{ fontFamily: FONT.times }}
                    >
                        {WEDDING.schedule.map((item, i) => (
                            <li key={item.label} className="contents">
                                <span className="pt-0.5 text-right text-[16px] md:text-[17px] leading-snug" style={{ color: BROWN }}>
                                    {item.icon && (
                                        <span className="relative inline-block">
                                            <span
                                                aria-hidden="true"
                                                className="absolute top-1/2 right-full flex w-max items-center justify-center translate-y-[calc(-50%_+_27px)] md:translate-y-[calc(-50%_+_32px)]"
                                                style={{ marginRight: 39 }}
                                            >
                                                <img alt="" loading="lazy" src={`${IMG}/${item.icon}`} className="block h-11 w-11 shrink-0 object-contain" />
                                            </span>
                                        </span>
                                    )}
                                </span>
                                <span aria-hidden="true" className="relative flex items-center justify-center self-stretch">
                                    <span
                                        className={`absolute left-1/2 -translate-x-1/2 w-px ${i === 0 ? 'top-1/2' : '-top-8 md:-top-10'} ${
                                            i === last ? 'bottom-1/2' : '-bottom-8 md:-bottom-10'
                                        }`}
                                        style={{ backgroundColor: line }}
                                    />
                                    <span
                                        className="relative block h-2.5 w-2.5 rounded-full"
                                        style={{
                                            backgroundColor: BROWN,
                                            boxShadow: `0 0 0 2px color-mix(in srgb, ${BROWN} 13%, transparent)`,
                                        }}
                                    />
                                </span>
                                <span className="pt-0.5 text-start text-[17px] md:text-[19px] font-medium leading-snug" style={{ color: BLUE }}>
                                    {item.label}
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </>
    )
}

type Wish = { name: string; message: string }

function Guestbook() {
    const [name, setName] = useState('')
    const [message, setMessage] = useState('')
    const [wishes, setWishes] = useState<Wish[]>([])

    const inputStyle: CSSProperties = { borderColor: `${BROWN}88`, color: BROWN, backgroundColor: '#fff' }

    const submit = (e: FormEvent) => {
        e.preventDefault()
        if (!name.trim() || !message.trim()) return
        setWishes((w) => [{ name: name.trim(), message: message.trim() }, ...w])
        setName('')
        setMessage('')
    }

    return (
        <div className="relative isolate z-10">
            <section
                className="relative z-10 px-6 md:px-10 pt-8 md:pt-10 pb-7 md:pb-9"
                style={{ color: BLUE, fontFamily: FONT.body }}
            >
                <h2 className="font-semibold text-[20px] md:text-[26px] text-center uppercase" style={{ color: BROWN, fontFamily: FONT.garamond }}>
                    Guestbook
                </h2>

                <form onSubmit={submit} className="mt-6 mx-auto w-full md:max-w-[600px]">
                    <div className="rounded-2xl border p-6 shadow-sm bg-white" style={{ borderColor: `${BROWN}38` }}>
                        <input
                            placeholder="Enter your name*"
                            className="mb-4 w-full rounded-lg border px-4 py-3 text-sm focus:outline-none"
                            maxLength={500}
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={inputStyle}
                        />
                        <textarea
                            placeholder="Enter your wishes*"
                            className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none resize-none"
                            rows={4}
                            maxLength={10000}
                            required
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            style={inputStyle}
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                type="submit"
                                className="rounded-full px-6 py-2 text-sm font-semibold text-white transition-transform hover:scale-105"
                                style={{ backgroundColor: BROWN, fontFamily: FONT.garamond }}
                            >
                                SEND WISHES
                            </button>
                        </div>
                    </div>
                </form>

                <div className="mt-8 w-full space-y-3 mx-auto md:max-w-[600px]">
                    {wishes.length === 0 ? (
                        <p className="text-center text-sm opacity-70">No wishes yet. Be the first!</p>
                    ) : (
                        wishes.map((w, i) => (
                            <div key={i} className="rounded-xl border bg-white/70 px-4 py-3" style={{ borderColor: `${BROWN}38` }}>
                                <p className="font-semibold text-sm" style={{ color: BROWN }}>{w.name}</p>
                                <p className="text-sm whitespace-pre-line">{w.message}</p>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    )
}

function Footer() {
    return (
        <div className="relative isolate">
            <footer className="relative z-20 flex flex-col items-center px-6 md:px-10 pb-[150px] md:pb-[280px] text-center">
                <span className="text-[11px] md:text-[15px] mx-auto md:max-w-[560px]" style={{ color: BROWN, fontFamily: FONT.body }}>
                    Your presence would be the greatest gift we could receive!
                </span>
            </footer>
            <Deco src="scene-decoration.webp" className="bottom-0 left-[-20.18%] w-[140.36%] translate-y-[10%] z-10" />
        </div>
    )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function QasrBlueInvitation() {
    return (
        <main className="min-h-screen w-full bg-white">
            <div className="flex w-full justify-center overflow-x-clip">
                <div
                    className="relative w-full max-w-[480px] md:max-w-[900px] md:mx-auto isolate overflow-visible md:overflow-hidden md:border md:border-[#72614b33]"
                    style={{ backgroundColor: CREAM, color: BLUE }}
                >
                    <Hero />
                    <Couple />
                    <Details />
                    <Venue />
                    <Schedule />
                    <Guestbook />
                    <Footer />
                </div>
            </div>
        </main>
    )
}
