import {
  useState, useRef, useEffect, useCallback,
} from 'react'
import {
  motion, AnimatePresence, useMotionValue, animate,
} from 'framer-motion'
import { coldDrinks } from '../data/coldDrinks'
import OlivaLogo from './OlivaLogo'

type View = 'hero' | 'all'
type NavRoute = 'home' | 'menu' | 'cold-drinks' | 'desserts'

const CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1]
const EXIT_EASE: [number, number, number, number] = [0.4, 0, 0.8, 1]
const DRAG_THRESHOLD = 48
const LOCK_MS = 960

function bgWordFontSize(word: string): string {
  const vw = 86 / (word.length * 0.58)
  return `min(${vw.toFixed(1)}vw, 360px)`
}

// ─── Dissolve variants ─────────────────────────────────────────────────────────
const dissolveV = {
  enter: (d: number) => ({
    opacity: 0, x: d > 0 ? 28 : -28, scale: 0.97, filter: 'blur(8px)',
    transition: { duration: 0 },
  }),
  center: {
    opacity: 1, x: 0, scale: 1, filter: 'blur(0px)',
    transition: {
      opacity: { duration: 0.62, ease: CINEMATIC, delay: 0.32 },
      x:       { duration: 0.62, ease: CINEMATIC, delay: 0.32 },
      scale:   { duration: 0.72, ease: CINEMATIC, delay: 0.28 },
      filter:  { duration: 0.72, ease: CINEMATIC, delay: 0.28 },
    },
  },
  exit: (d: number) => ({
    opacity: 0, x: d > 0 ? -28 : 28, scale: 0.96, filter: 'blur(7px)',
    transition: {
      opacity: { duration: 0.42, ease: EXIT_EASE },
      x:       { duration: 0.42, ease: EXIT_EASE },
      scale:   { duration: 0.45, ease: EXIT_EASE },
      filter:  { duration: 0.38, ease: EXIT_EASE },
    },
  }),
}
const dissolveVReduced = {
  enter: { opacity: 0, transition: { duration: 0 } },
  center: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

// ─── Cold drink image placeholder ──────────────────────────────────────────────
function ColdDrinkPlaceholder({ size = 160 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size * 1.3} viewBox="0 0 120 156" fill="none"
        style={{ pointerEvents: 'none', userSelect: 'none' }}>
        {/* Cup body */}
        <path d="M20 30 L100 30 L92 146 Q90 152 84 152 L36 152 Q30 152 28 146 Z"
          fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
        {/* Liquid */}
        <path d="M24 44 L96 44 L90 140 Q88 146 82 146 L38 146 Q32 146 30 140 Z"
          fill="rgba(255,255,255,0.08)" />
        {/* Ice cubes */}
        <rect x="34" y="56" width="22" height="22" rx="4" fill="rgba(255,255,255,0.18)" transform="rotate(12 45 67)" />
        <rect x="62" y="64" width="20" height="20" rx="4" fill="rgba(255,255,255,0.15)" transform="rotate(-8 72 74)" />
        <rect x="44" y="86" width="24" height="24" rx="4" fill="rgba(255,255,255,0.12)" transform="rotate(20 56 98)" />
        {/* Straw */}
        <rect x="58" y="8" width="6" height="48" rx="3" fill="rgba(255,255,255,0.3)" transform="rotate(8 61 32)" />
        {/* Lid */}
        <ellipse cx="60" cy="30" rx="42" ry="5" fill="rgba(255,255,255,0.2)" />
      </svg>
      <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', fontWeight: 600 }}>
        Image Soon
      </p>
    </div>
  )
}

// ─── Product panel (one dissolve unit) ───────────────────────────────────────
function ProductPanel({ drink, dir, reducedMotion }: {
  drink: typeof coldDrinks[number]; dir: number; reducedMotion: boolean
}) {
  const variants = reducedMotion ? dissolveVReduced : dissolveV
  const placeholderSize = typeof window !== 'undefined' ? Math.min(180, Math.max(110, window.innerHeight * 0.26)) : 150

  return (
    <motion.div
      key={drink.name} custom={dir} variants={variants}
      initial="enter" animate="center" exit="exit"
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', willChange: 'opacity, transform, filter' }}
    >
      {/* Giant background word */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1 }}>
        <span style={{ fontSize: bgWordFontSize(drink.shortName), fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: 'rgba(255,255,255,0.09)', whiteSpace: 'nowrap', userSelect: 'none' }}>
          {drink.shortName}
        </span>
      </div>

      {/* Product grid */}
      <div className="cdp-hero-grid" style={{ position: 'relative', zIndex: 2, flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 'clamp(12px,3vw,48px)', alignItems: 'center', maxWidth: 1180, width: '100%', margin: '0 auto', padding: 'clamp(8px,2vh,20px) clamp(56px,8vw,96px)' }}>
        {/* Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px,2vh,20px)' }}>
          <p style={{ margin: 0, fontSize: 'clamp(9px,1.1vw,12px)', fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Cold Drinks</p>
          <h2 style={{ margin: 0, fontSize: 'clamp(26px,4.2vw,68px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.05 }}>{drink.name}</h2>
          <p style={{ margin: 0, fontSize: 'clamp(13px,1.3vw,17px)', color: 'rgba(255,255,255,0.62)', lineHeight: 1.6, maxWidth: 340 }}>{drink.description}</p>
          <p style={{ margin: 0, fontSize: 'clamp(24px,3.2vw,54px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>{drink.price}</p>
        </div>
        {/* Image */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {drink.image ? (
            <img src={drink.image} alt={drink.name} draggable={false}
              style={{ maxHeight: 'clamp(160px,36vh,400px)', objectFit: 'contain', filter: 'drop-shadow(0 24px 64px rgba(0,0,0,0.45))', userSelect: 'none' }} />
          ) : (
            <ColdDrinkPlaceholder size={placeholderSize} />
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Arrow button ─────────────────────────────────────────────────────────────
function ArrowBtn({ dir, onClick, disabled }: { dir: 'left' | 'right'; onClick: () => void; disabled: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      onPointerDown={e => e.stopPropagation()}
      aria-label={dir === 'left' ? 'Previous' : 'Next'}
      style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        [dir === 'left' ? 'left' : 'right']: 'clamp(8px,1.5vw,20px)', zIndex: 20,
        width: 'clamp(40px,5vw,52px)', height: 'clamp(40px,5vw,52px)', borderRadius: '50%',
        background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.38 : 1,
        transition: 'background 0.2s, opacity 0.3s', padding: 0,
      }}
      onMouseOver={e => { if (!disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.28)' }}
      onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)' }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
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
        <button key={i} onClick={() => onDot(i)} aria-label={`Drink ${i + 1}`}
          style={{ width: i === active ? 28 : 8, height: 8, borderRadius: 4, background: i === active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.45s cubic-bezier(0.4,0,0.2,1)' }} />
      ))}
    </div>
  )
}

// ─── Hero view ────────────────────────────────────────────────────────────────
function HeroView({
  idx, dir, locked, reducedMotion,
  onPrev, onNext, onDot, onShowAll,
  onPointerDown,
}: {
  idx: number; dir: number; locked: boolean; reducedMotion: boolean
  onPrev: () => void; onNext: () => void; onDot: (i: number) => void; onShowAll: () => void
  onPointerDown: (e: React.PointerEvent) => void
}) {
  return (
    <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: CINEMATIC }}
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
      >
        <AnimatePresence custom={dir} mode="sync">
          <ProductPanel key={idx} drink={coldDrinks[idx]} dir={dir} reducedMotion={reducedMotion} />
        </AnimatePresence>
        <ArrowBtn dir="left" onClick={onPrev} disabled={locked} />
        <ArrowBtn dir="right" onClick={onNext} disabled={locked} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, paddingBottom: 'clamp(16px,3.5vh,32px)', zIndex: 10 }}>
        <Dots total={coldDrinks.length} active={idx} onDot={onDot} />
        <button onClick={onShowAll}
          style={{ padding: '11px 30px', borderRadius: 999, background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.28)', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', cursor: 'pointer', transition: 'background 0.22s, transform 0.15s' }}
          onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
          onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >SHOW ALL COLD DRINKS</button>
      </div>
    </motion.div>
  )
}

// ─── Cold drink card ──────────────────────────────────────────────────────────
function adjustColor(hex: string, amount: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, ((n >> 16) & 0xff) + amount)
  const g = Math.min(255, ((n >> 8) & 0xff) + amount)
  const b = Math.min(255, (n & 0xff) + amount)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

function DrinkCard({ drink, dist, cardW, cardH, onClick }: {
  drink: typeof coldDrinks[number]; dist: number; cardW: number; cardH: number; onClick: () => void
}) {
  const abs = Math.abs(dist)
  const isCenter = abs === 0
  return (
    <motion.div
      animate={{ scale: isCenter ? 1 : abs === 1 ? 0.9 : 0.8, opacity: isCenter ? 1 : abs === 1 ? 0.68 : abs === 2 ? 0.3 : 0 }}
      transition={{ duration: 0.45, ease: CINEMATIC }}
      onClick={onClick}
      style={{
        width: cardW, height: cardH, flexShrink: 0,
        borderRadius: 28,
        background: `linear-gradient(150deg, ${drink.bgColor}ee 0%, ${adjustColor(drink.bgColor, 30)} 100%)`,
        border: `1px solid rgba(255,255,255,${isCenter ? 0.22 : 0.1})`,
        cursor: isCenter ? 'pointer' : 'default',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: isCenter ? '0 32px 80px rgba(0,0,0,0.45)' : '0 8px 24px rgba(0,0,0,0.2)',
        filter: abs > 1 ? 'blur(2px)' : 'none',
        transition: 'box-shadow 0.35s, filter 0.35s',
      }}
    >
      {/* Image area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px 12px', background: 'rgba(0,0,0,0.12)' }}>
        {drink.image ? (
          <img src={drink.image} alt={drink.name} draggable={false}
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', userSelect: 'none', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))' }} />
        ) : (
          <ColdDrinkPlaceholder size={Math.min(90, cardW * 0.38)} />
        )}
      </div>
      {/* Info */}
      <div style={{ padding: '16px 20px 20px', background: 'rgba(0,0,0,0.18)', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <p style={{ margin: 0, fontSize: 'clamp(14px,1.7vw,18px)', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{drink.name}</p>
          <p style={{ margin: 0, marginLeft: 10, fontSize: 'clamp(14px,1.7vw,18px)', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{drink.price}</p>
        </div>
        <p style={{ margin: 0, fontSize: 'clamp(11px,1.1vw,13px)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.45 }}>{drink.description}</p>
      </div>
    </motion.div>
  )
}

// ─── All Cold Drinks view (horizontal carousel) ───────────────────────────────
function AllColdDrinksView({ initialIdx, onSelect, onBack }: {
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
    ro.observe(el); return () => ro.disconnect()
  }, [])

  const FRAC = cw < 640 ? 0.82 : 0.46
  const GAP = 24
  const cardW = cw * FRAC
  const cardH = Math.min(500, Math.max(280, ch * 0.78))

  const getTarget = useCallback((i: number) => !cw ? 0 : cw / 2 - cardW / 2 - i * (cardW + GAP), [cw, cardW])

  useEffect(() => {
    if (!cw) return
    const ctrl = animate(trackX, getTarget(idx), { type: 'spring', stiffness: 300, damping: 30, restDelta: 0.5 })
    return () => ctrl.stop()
  }, [idx, getTarget])

  const snap = useCallback((i: number) => setIdx(Math.max(0, Math.min(i, coldDrinks.length - 1))), [])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      trackX.set(trackStart.current + (e.clientX - dragStartX.current))
    }
    const onUp = (e: PointerEvent) => {
      if (!dragging.current) return; dragging.current = false
      const diff = e.clientX - dragStartX.current
      if (Math.abs(diff) > DRAG_THRESHOLD) snap(idx + (diff < 0 ? 1 : -1))
      else animate(trackX, getTarget(idx), { type: 'spring', stiffness: 300, damping: 30 })
    }
    const onCancel = () => { dragging.current = false; animate(trackX, getTarget(idx), { type: 'spring', stiffness: 300, damping: 30 }) }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
    }
  }, [idx, getTarget, snap, trackX])

  const onPD = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true; dragStartX.current = e.clientX; trackStart.current = trackX.get()
  }
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 8) snap(idx + (e.deltaX > 0 ? 1 : -1)) }

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setIdx(i => Math.max(0, i - 1))
      else if (e.key === 'ArrowRight') setIdx(i => Math.min(coldDrinks.length - 1, i + 1))
    }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [])

  return (
    <motion.div key="all" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.55, ease: CINEMATIC }}
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 0 clamp(16px,3vh,28px)', gap: 'clamp(14px,2.5vh,24px)' }}
    >
      {/* Back button */}
      <motion.button initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.42, ease: CINEMATIC }}
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 22px', borderRadius: 999, background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.26)', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', transition: 'background 0.2s' }}
        onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.24)')}
        onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
        BACK TO PRODUCT VIEW
      </motion.button>

      {/* Card track */}
      <div ref={containerRef}
        style={{ flex: 1, width: '100%', overflow: 'hidden', cursor: 'grab', touchAction: 'pan-y', display: 'flex', alignItems: 'center' }}
        onPointerDown={onPD} onWheel={onWheel}
      >
        <motion.div style={{ x: trackX, display: 'flex', gap: GAP, userSelect: 'none' }}>
          {coldDrinks.map((drink, i) => (
            <DrinkCard key={drink.name} drink={drink} dist={i - idx} cardW={cardW} cardH={cardH}
              onClick={() => i === idx ? onSelect(i) : snap(i)} />
          ))}
        </motion.div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12 }}>
        {(['left', 'right'] as const).map(d => (
          <button key={d} onClick={() => snap(d === 'left' ? idx - 1 : idx + 1)}
            disabled={d === 'left' ? idx === 0 : idx === coldDrinks.length - 1}
            style={{ width: 42, height: 42, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.16)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (d === 'left' ? idx === 0 : idx === coldDrinks.length - 1) ? 0.35 : 1, transition: 'opacity 0.2s' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: d === 'right' ? 'scaleX(-1)' : 'none' }}><path d="M15 18l-6-6 6-6" /></svg>
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
  const [allInit, setAllInit] = useState(0)
  const [locked, setLocked] = useState(false)

  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pStartX = useRef<number | null>(null)
  const pStartY = useRef<number | null>(null)
  const isDrag = useRef(false)
  const reducedMotion = useRef(
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
  )

  const drink = coldDrinks[heroIdx]

  const paginate = useCallback((d: number) => {
    setLocked(prev => {
      if (prev) return prev
      setDir(d)
      setHeroIdx(p => (p + d + coldDrinks.length) % coldDrinks.length)
      if (lockTimer.current) clearTimeout(lockTimer.current)
      lockTimer.current = setTimeout(() => setLocked(false), LOCK_MS)
      return true
    })
  }, [])

  const goTo = useCallback((i: number) => {
    if (i === heroIdx) return
    setLocked(prev => {
      if (prev) return prev
      setDir(i > heroIdx ? 1 : -1)
      setHeroIdx(i)
      if (lockTimer.current) clearTimeout(lockTimer.current)
      lockTimer.current = setTimeout(() => setLocked(false), LOCK_MS)
      return true
    })
  }, [heroIdx])

  useEffect(() => () => { if (lockTimer.current) clearTimeout(lockTimer.current) }, [])

  useEffect(() => {
    if (view !== 'hero') return
    const h = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') paginate(-1); else if (e.key === 'ArrowRight') paginate(1) }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [view, paginate])

  // Drag via window listeners — no pointer capture, so arrow clicks keep working
  useEffect(() => {
    if (view !== 'hero') return
    const onMove = (e: PointerEvent) => {
      if (pStartX.current === null) return
      const dx = Math.abs(e.clientX - pStartX.current), dy = Math.abs(e.clientY - (pStartY.current ?? 0))
      if (dx > dy && dx > 8) isDrag.current = true
    }
    const onUp = (e: PointerEvent) => {
      if (pStartX.current === null) return
      const diff = e.clientX - pStartX.current
      if (isDrag.current && Math.abs(diff) > DRAG_THRESHOLD) paginate(diff < 0 ? 1 : -1)
      pStartX.current = null; pStartY.current = null; isDrag.current = false
    }
    const onCancel = () => { pStartX.current = null; pStartY.current = null; isDrag.current = false }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
    }
  }, [view, paginate])

  const onPD = useCallback((e: React.PointerEvent) => {
    if (view !== 'hero') return
    pStartX.current = e.clientX; pStartY.current = e.clientY; isDrag.current = false
  }, [view])

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Animated background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundColor: drink.bgColor, transition: 'background-color 0.75s cubic-bezier(0.4,0,0.2,1)' }} />
      {/* Cool center glow */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(100,150,255,0.06) 0%, transparent 80%)' }} />

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
            <HeroView key="hero" idx={heroIdx} dir={dir} locked={locked} reducedMotion={reducedMotion.current}
              onPrev={() => paginate(-1)} onNext={() => paginate(1)} onDot={goTo}
              onShowAll={() => { setAllInit(heroIdx); setView('all') }}
              onPointerDown={onPD}
            />
          ) : (
            <AllColdDrinksView key="all" initialIdx={allInit}
              onSelect={(i) => { setHeroIdx(i); setView('hero') }}
              onBack={() => setView('hero')}
            />
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @media (max-width: 620px) {
          .cdp-hero-grid { grid-template-columns: 1fr !important; }
          .cdp-hero-grid > div:last-child { order: -1; }
        }
      `}</style>
    </div>
  )
}
