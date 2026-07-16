import {
  useState, useRef, useEffect, useCallback,
} from 'react'
import {
  motion, AnimatePresence, useMotionValue, animate,
} from 'framer-motion'
import { coldDrinks } from '../data/coldDrinks'
import OlivaLogo from './OlivaLogo'

type View = 'hero' | 'carousel'
type NavRoute = 'home' | 'menu' | 'cold-drinks'

const CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1]
const EXIT_EASE: [number, number, number, number] = [0.4, 0, 0.8, 1]
const DRAG_THRESHOLD = 48
const LOCK_MS = 960

// Auto-size the background word so it never overflows or gets cut off.
// Bold uppercase chars are ~0.58× the font-size wide (after letter-spacing).
function bgWordFontSize(word: string): string {
  const vw = 86 / (word.length * 0.58)
  return `min(${vw.toFixed(1)}vw, 360px)`
}

// ─── Dissolve variants ────────────────────────────────────────────────────────
// The entire product panel (bg word + text + image) dissolves as one unit.
// custom = dir: +1 right, -1 left
const dissolveV = {
  enter: (d: number) => ({
    opacity: 0,
    x: d > 0 ? 28 : -28,
    scale: 0.97,
    filter: 'blur(8px)',
    transition: { duration: 0 },            // snap to initial state instantly
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      opacity: { duration: 0.62, ease: CINEMATIC, delay: 0.32 },
      x:       { duration: 0.62, ease: CINEMATIC, delay: 0.32 },
      scale:   { duration: 0.72, ease: CINEMATIC, delay: 0.28 },
      filter:  { duration: 0.72, ease: CINEMATIC, delay: 0.28 },
    },
  },
  exit: (d: number) => ({
    opacity: 0,
    x: d > 0 ? -28 : 28,
    scale: 0.96,
    filter: 'blur(7px)',
    transition: {
      opacity: { duration: 0.42, ease: EXIT_EASE },
      x:       { duration: 0.42, ease: EXIT_EASE },
      scale:   { duration: 0.45, ease: EXIT_EASE },
      filter:  { duration: 0.38, ease: EXIT_EASE },
    },
  }),
}

// Reduced-motion: simple crossfade, no movement or blur
const dissolveVReduced = {
  enter: { opacity: 0, transition: { duration: 0 } },
  center: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

// ─── Cup placeholder ──────────────────────────────────────────────────────────
function CupSVG({ size }: { size: number }) {
  return (
    <svg
      width={size} height={Math.round(size * 1.35)}
      viewBox="0 0 180 243" fill="none"
      style={{ pointerEvents: 'none', userSelect: 'none', flexShrink: 0 }}
    >
      <rect x="98" y="0" width="11" height="44" rx="5.5" fill="rgba(255,255,255,0.42)" />
      <ellipse cx="90" cy="33" rx="72" ry="15" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
      <rect x="20" y="26" width="140" height="13" rx="6" fill="rgba(255,255,255,0.12)" />
      <path d="M28 39 L38 222 Q39 237 56 237 L124 237 Q141 237 142 222 L152 39 Z"
        fill="rgba(255,255,255,0.09)" stroke="rgba(255,255,255,0.42)" strokeWidth="1.5" />
      <path d="M31 70 L38 222 Q39 237 56 237 L124 237 Q141 237 142 222 L149 70 Z"
        fill="rgba(255,255,255,0.06)" />
      <rect x="54" y="88" width="28" height="28" rx="5" fill="rgba(255,255,255,0.2)" transform="rotate(18 68 102)" />
      <rect x="84" y="118" width="25" height="25" rx="5" fill="rgba(255,255,255,0.15)" transform="rotate(-12 96 131)" />
      <rect x="58" y="152" width="22" height="22" rx="5" fill="rgba(255,255,255,0.17)" transform="rotate(22 69 163)" />
      <rect x="98" y="145" width="20" height="20" rx="4" fill="rgba(255,255,255,0.13)" transform="rotate(-8 108 155)" />
    </svg>
  )
}

// ─── Arrow button ─────────────────────────────────────────────────────────────
function ArrowBtn({ dir, onClick, disabled }: { dir: 'left' | 'right'; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'left' ? 'Previous product' : 'Next product'}
      style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        [dir === 'left' ? 'left' : 'right']: 'clamp(8px,1.5vw,20px)',
        zIndex: 20,
        width: 'clamp(40px,5vw,52px)',
        height: 'clamp(40px,5vw,52px)',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.14)',
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.38 : 1,
        transition: 'background 0.2s, opacity 0.3s',
        padding: 0,
      }}
      onMouseOver={e => { if (!disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.28)' }}
      onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)' }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: dir === 'right' ? 'scaleX(-1)' : 'none' }}>
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  )
}

// ─── Pagination dots ──────────────────────────────────────────────────────────
function Dots({ total, active, onDot }: { total: number; active: number; onDot: (i: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onDot(i)}
          aria-label={`Product ${i + 1}`}
          style={{
            width: i === active ? 28 : 8, height: 8, borderRadius: 4,
            background: i === active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.3)',
            border: 'none', cursor: 'pointer', padding: 0,
            transition: 'all 0.45s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      ))}
    </div>
  )
}

// ─── Product panel (one dissolve unit: bg word + text + image) ────────────────
function ProductPanel({ drink, dir, reducedMotion }: {
  drink: typeof coldDrinks[number]
  dir: number
  reducedMotion: boolean
}) {
  const variants = reducedMotion ? dissolveVReduced : dissolveV
  const cupSize  = typeof window !== 'undefined'
    ? Math.min(200, Math.max(120, window.innerHeight * 0.28))
    : 160

  return (
    <motion.div
      key={drink.name}
      custom={dir}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        willChange: 'opacity, transform, filter',
      }}
    >
      {/* Giant transparent background word */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', zIndex: 0,
      }}>
        <span style={{
          fontSize: bgWordFontSize(drink.shortName),
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          color: 'rgba(255,255,255,0.11)',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}>
          {drink.shortName}
        </span>
      </div>

      {/* Product grid */}
      <div
        className="cd-hero-grid"
        style={{
          position: 'relative', zIndex: 1,
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
          gap: 'clamp(12px,3vw,48px)',
          alignItems: 'center',
          maxWidth: 1180, width: '100%',
          margin: '0 auto',
          padding: 'clamp(8px,2vh,20px) clamp(56px,8vw,96px)',
        }}
      >
        {/* Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px,2vh,20px)' }}>
          <p style={{ margin: 0, fontSize: 'clamp(9px,1.1vw,12px)', fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.52)', textTransform: 'uppercase' }}>
            Cold Drinks
          </p>
          <h2 style={{ margin: 0, fontSize: 'clamp(26px,4.2vw,68px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.05 }}>
            {drink.name}
          </h2>
          <p style={{ margin: 0, fontSize: 'clamp(13px,1.3vw,17px)', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxWidth: 340 }}>
            {drink.description}
          </p>
          <p style={{ margin: 0, fontSize: 'clamp(24px,3.2vw,54px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
            {drink.price}
          </p>
        </div>

        {/* Image */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {drink.image ? (
            <img
              src={drink.image} alt={drink.name} draggable={false}
              style={{ maxHeight: 'clamp(160px,36vh,400px)', objectFit: 'contain', filter: 'drop-shadow(0 24px 64px rgba(0,0,0,0.42))', userSelect: 'none' }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <CupSVG size={cupSize} />
              <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.36)', textTransform: 'uppercase', fontWeight: 600 }}>
                Image Soon
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Hero view ────────────────────────────────────────────────────────────────
function HeroView({
  idx, dir, locked, reducedMotion,
  onPrev, onNext, onDot, onShowAll,
  onPointerDown, onPointerMove, onPointerUp, onPointerCancel,
}: {
  idx: number; dir: number; locked: boolean; reducedMotion: boolean
  onPrev: () => void; onNext: () => void
  onDot: (i: number) => void; onShowAll: () => void
  onPointerDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp:   (e: React.PointerEvent) => void
  onPointerCancel: () => void
}) {
  return (
    <motion.div
      key="hero"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: CINEMATIC }}
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}
    >
      {/* Dissolve area: pointer events handled here for drag/swipe */}
      <div
        style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {/* AnimatePresence with custom=dir propagated for correct exit direction */}
        <AnimatePresence custom={dir} mode="sync">
          <ProductPanel
            key={idx}
            drink={coldDrinks[idx]}
            dir={dir}
            reducedMotion={reducedMotion}
          />
        </AnimatePresence>

        {/* Arrows — not part of dissolve, always visible */}
        <ArrowBtn dir="left"  onClick={onPrev} disabled={locked} />
        <ArrowBtn dir="right" onClick={onNext} disabled={locked} />
      </div>

      {/* Bottom bar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, paddingBottom: 'clamp(16px,3.5vh,32px)', zIndex: 10 }}>
        <Dots total={coldDrinks.length} active={idx} onDot={onDot} />
        <button
          onClick={onShowAll}
          style={{
            padding: '11px 30px', borderRadius: 999,
            background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.28)',
            color: '#fff', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.12em', cursor: 'pointer',
            transition: 'background 0.22s, transform 0.15s',
          }}
          onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
          onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          SHOW ALL COLD DRINKS
        </button>
      </div>
    </motion.div>
  )
}

// ─── Carousel card ────────────────────────────────────────────────────────────
function CarouselCard({ drink, dist, cardW, cardH, onClickCard }: {
  drink: typeof coldDrinks[number]; dist: number
  cardW: number; cardH: number; onClickCard: () => void
}) {
  const abs = Math.abs(dist)
  return (
    <motion.div
      animate={{
        scale: abs === 0 ? 1 : abs === 1 ? 0.88 : 0.77,
        opacity: abs === 0 ? 1 : abs === 1 ? 0.65 : abs === 2 ? 0.28 : 0,
      }}
      transition={{ duration: 0.42, ease: CINEMATIC }}
      onClick={onClickCard}
      style={{
        width: cardW, height: cardH, flexShrink: 0,
        borderRadius: 22,
        background: `linear-gradient(155deg, ${drink.bgColor}f0, ${drink.bgColor}a0)`,
        border: '1px solid rgba(255,255,255,0.2)',
        cursor: abs === 0 ? 'pointer' : 'default',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: abs === 0 ? '0 28px 72px rgba(0,0,0,0.38)' : '0 8px 24px rgba(0,0,0,0.18)',
        filter: abs > 1 ? 'blur(2px)' : 'none',
        transition: 'box-shadow 0.3s, filter 0.3s',
      }}
    >
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 20px 12px' }}>
        {drink.image ? (
          <img src={drink.image} alt={drink.name} draggable={false}
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', userSelect: 'none' }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <CupSVG size={Math.min(80, cardW * 0.32)} />
            <p style={{ margin: 0, fontSize: 8, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.36)', textTransform: 'uppercase', fontWeight: 600 }}>Image Soon</p>
          </div>
        )}
      </div>
      <div style={{ padding: '14px 18px 18px', borderTop: '1px solid rgba(255,255,255,0.14)', background: 'rgba(0,0,0,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <p style={{ margin: 0, fontSize: 'clamp(13px,1.6vw,16px)', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{drink.name}</p>
          <p style={{ margin: 0, marginLeft: 8, fontSize: 'clamp(13px,1.6vw,16px)', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{drink.price}</p>
        </div>
        <p style={{ margin: 0, fontSize: 'clamp(10px,1.1vw,12px)', color: 'rgba(255,255,255,0.58)', lineHeight: 1.45 }}>{drink.description}</p>
      </div>
    </motion.div>
  )
}

// ─── Carousel view ────────────────────────────────────────────────────────────
function CarouselView({ initialIdx, onSelect, onBack }: {
  initialIdx: number; onSelect: (i: number) => void; onBack: () => void
}) {
  const [idx, setIdx] = useState(initialIdx)
  const containerRef = useRef<HTMLDivElement>(null)
  const [cw, setCw] = useState(0)
  const [ch, setCh] = useState(0)
  const trackX = useMotionValue(0)
  const dragging = useRef(false)
  const dragStartX = useRef(0)
  const trackStart = useRef(0)

  useEffect(() => {
    const el = containerRef.current; if (!el) return
    const ro = new ResizeObserver(([e]) => { setCw(e.contentRect.width); setCh(e.contentRect.height) })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const FRAC = cw < 640 ? 0.78 : 0.66
  const GAP = 20
  const cardW = cw * FRAC
  const cardH = Math.min(460, Math.max(260, ch * 0.78))

  const getTarget = useCallback((i: number) => !cw ? 0 : cw / 2 - cardW / 2 - i * (cardW + GAP), [cw, cardW])

  useEffect(() => {
    if (!cw) return
    const ctrl = animate(trackX, getTarget(idx), { type: 'spring', stiffness: 300, damping: 30, restDelta: 0.5 })
    return () => ctrl.stop()
  }, [idx, getTarget])

  const snap = useCallback((i: number) => setIdx(Math.max(0, Math.min(i, coldDrinks.length - 1))), [])

  const onPD = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true; dragStartX.current = e.clientX; trackStart.current = trackX.get()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPM = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    trackX.set(trackStart.current + (e.clientX - dragStartX.current))
  }
  const onPU = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return; dragging.current = false
    const diff = e.clientX - dragStartX.current
    if (Math.abs(diff) > DRAG_THRESHOLD) snap(idx + (diff < 0 ? 1 : -1))
    else animate(trackX, getTarget(idx), { type: 'spring', stiffness: 300, damping: 30 })
  }
  const onPC = () => { dragging.current = false; animate(trackX, getTarget(idx), { type: 'spring', stiffness: 300, damping: 30 }) }
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 8) snap(idx + (e.deltaX > 0 ? 1 : -1))
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setIdx(i => Math.max(0, i - 1))
      else if (e.key === 'ArrowRight') setIdx(i => Math.min(coldDrinks.length - 1, i + 1))
    }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [])

  return (
    <motion.div
      key="carousel"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.55, ease: CINEMATIC }}
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 0 clamp(16px,3vh,28px)', gap: 'clamp(14px,2.5vh,24px)' }}
    >
      <motion.button
        initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.42, ease: CINEMATIC }}
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 22px', borderRadius: 999, background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.26)', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', transition: 'background 0.2s' }}
        onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.24)')}
        onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
        BACK TO PRODUCT VIEW
      </motion.button>

      <div ref={containerRef}
        style={{ flex: 1, width: '100%', overflow: 'hidden', cursor: 'grab', touchAction: 'pan-y', display: 'flex', alignItems: 'center' }}
        onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU} onPointerCancel={onPC} onWheel={onWheel}
      >
        <motion.div style={{ x: trackX, display: 'flex', gap: GAP, userSelect: 'none' }}>
          {coldDrinks.map((drink, i) => (
            <CarouselCard key={drink.name} drink={drink} dist={i - idx} cardW={cardW} cardH={cardH}
              onClickCard={() => i === idx ? onSelect(i) : snap(i)} />
          ))}
        </motion.div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        {(['left', 'right'] as const).map(d => (
          <button key={d}
            onClick={() => snap(d === 'left' ? idx - 1 : idx + 1)}
            disabled={d === 'left' ? idx === 0 : idx === coldDrinks.length - 1}
            style={{ width: 42, height: 42, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.16)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (d === 'left' ? idx === 0 : idx === coldDrinks.length - 1) ? 0.35 : 1, transition: 'opacity 0.2s, background 0.2s' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: d === 'right' ? 'scaleX(-1)' : 'none' }}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ))}
      </div>
      <Dots total={coldDrinks.length} active={idx} onDot={snap} />
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ColdDrinksPage({ navigate }: { navigate: (to: NavRoute) => void }) {
  const [view, setView] = useState<View>('hero')
  const [heroIdx, setHeroIdx] = useState(0)
  const [dir, setDir] = useState(1)
  const [carouselInit, setCarouselInit] = useState(0)

  const locked = useRef(false)           // interaction lock during transition
  const pointerStartX = useRef<number | null>(null)
  const pointerStartY = useRef<number | null>(null)
  const isDragHero = useRef(false)
  const reducedMotion = useRef(
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
  )

  const drink = coldDrinks[heroIdx]

  const paginate = useCallback((d: number) => {
    if (locked.current) return
    locked.current = true
    setDir(d)
    setHeroIdx(prev => (prev + d + coldDrinks.length) % coldDrinks.length)
    setTimeout(() => { locked.current = false }, LOCK_MS)
  }, [])

  const goTo = useCallback((i: number) => {
    if (locked.current || i === heroIdx) return
    locked.current = true
    setDir(i > heroIdx ? 1 : -1)
    setHeroIdx(i)
    setTimeout(() => { locked.current = false }, LOCK_MS)
  }, [heroIdx])

  // Keyboard
  useEffect(() => {
    if (view !== 'hero') return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') paginate(-1)
      else if (e.key === 'ArrowRight') paginate(1)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [view, paginate])

  // Hero pointer events (mouse drag + touch, unified)
  const onPD = useCallback((e: React.PointerEvent) => {
    if (view !== 'hero') return
    pointerStartX.current = e.clientX
    pointerStartY.current = e.clientY
    isDragHero.current = false
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [view])

  const onPM = useCallback((e: React.PointerEvent) => {
    if (pointerStartX.current === null) return
    const dx = Math.abs(e.clientX - pointerStartX.current)
    const dy = Math.abs(e.clientY - (pointerStartY.current ?? 0))
    if (dx > dy && dx > 8) isDragHero.current = true
  }, [])

  const onPU = useCallback((e: React.PointerEvent) => {
    if (pointerStartX.current === null) return
    const diff = e.clientX - pointerStartX.current
    if (isDragHero.current && Math.abs(diff) > DRAG_THRESHOLD) paginate(diff < 0 ? 1 : -1)
    pointerStartX.current = null; pointerStartY.current = null; isDragHero.current = false
  }, [paginate])

  const onPC = useCallback(() => { pointerStartX.current = null; isDragHero.current = false }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Animated background color */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundColor: drink.bgColor,
        transition: `background-color 0.75s cubic-bezier(0.4,0,0.2,1)`,
      }} />

      {/* Subtle center glow */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(255,255,255,0.055) 0%, transparent 80%)',
      }} />

      {/* Nav */}
      <nav style={{ position: 'relative', zIndex: 10, height: 64, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(16px,4vw,40px)' }}>
        <button onClick={() => navigate('home')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer' }}>
          <OlivaLogo size={38} showText={false} />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 17, letterSpacing: '0.05em', textShadow: '0 2px 8px rgba(0,0,0,0.28)' }}>OLIVA</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px,3vw,28px)' }}>
          {(['Home', 'Menu'] as const).map(label => (
            <button key={label} onClick={() => navigate(label.toLowerCase() as NavRoute)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', transition: 'color 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.color = '#fff')}
              onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
            >{label}</button>
          ))}
          <button onClick={() => navigate('menu')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.24)', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.24)')}
            onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Menu
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, position: 'relative', zIndex: 2 }}>
        <AnimatePresence mode="wait">
          {view === 'hero' ? (
            <HeroView
              key="hero"
              idx={heroIdx} dir={dir}
              locked={locked.current}
              reducedMotion={reducedMotion.current}
              onPrev={() => paginate(-1)}
              onNext={() => paginate(1)}
              onDot={goTo}
              onShowAll={() => { setCarouselInit(heroIdx); setView('carousel') }}
              onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU} onPointerCancel={onPC}
            />
          ) : (
            <CarouselView
              key="carousel"
              initialIdx={carouselInit}
              onSelect={(i) => { setHeroIdx(i); setView('hero') }}
              onBack={() => setView('hero')}
            />
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @media (max-width: 620px) {
          .cd-hero-grid { grid-template-columns: 1fr !important; }
          .cd-hero-grid > div:last-child { order: -1; }
        }
      `}</style>
    </div>
  )
}
