import {
  useState, useRef, useEffect, useCallback,
} from 'react'
import {
  motion, AnimatePresence, useMotionValue, animate,
} from 'framer-motion'
import { desserts, type DecorationType } from '../data/desserts'
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

// ─── Dissolve variants (identical to Cold Drinks) ─────────────────────────────
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

// ─── Decoration positions spread around the viewport ─────────────────────────
const POSITIONS = [
  { left: '5%',  top: '14%' },
  { left: '80%', top: '9%'  },
  { left: '88%', top: '56%' },
  { left: '9%',  top: '68%' },
  { left: '44%', top: '6%'  },
  { left: '68%', top: '80%' },
  { left: '24%', top: '40%' },
  { left: '60%', top: '24%' },
  { left: '16%', top: '82%' },
  { left: '82%', top: '38%' },
]

function ChocoDripSVG() {
  return (
    <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
      <path d="M8 0 C3 0 0 4 0 8 Q0 16 8 24 Q16 16 16 8 C16 4 13 0 8 0Z"
        fill="rgba(100,40,10,0.55)" />
      <path d="M8 4 C5.5 4 4 6 4 8 Q4 14 8 20 Q12 14 12 8 C12 6 10.5 4 8 4Z"
        fill="rgba(150,70,20,0.35)" />
    </svg>
  )
}

function ChocoPieceSVG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="16" height="16" rx="3" fill="rgba(80,30,5,0.5)" transform="rotate(22 9 9)" />
      <rect x="4" y="4" width="10" height="10" rx="2" fill="rgba(120,55,15,0.35)" transform="rotate(22 9 9)" />
    </svg>
  )
}

function BerrySVG() {
  return (
    <svg width="15" height="16" viewBox="0 0 15 16" fill="none">
      <ellipse cx="7.5" cy="2.5" rx="2.5" ry="2" fill="rgba(40,70,15,0.6)" />
      <circle cx="7.5" cy="10.5" r="5.5" fill="rgba(170,30,40,0.55)" />
      <circle cx="5.5" cy="8.5" r="2" fill="rgba(220,80,90,0.4)" />
    </svg>
  )
}

function CreamSwirlSVG() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 18 C5 18 2 15 3 11 C4 8 7 7 10 8 C13 7 16 8 17 11 C18 15 15 18 10 18Z"
        fill="rgba(240,230,210,0.45)" />
      <path d="M10 14 C7.5 14 6 12.5 6.5 11 C7 9.5 8.5 9 10 9.5 C11.5 9 13 9.5 13.5 11 C14 12.5 12.5 14 10 14Z"
        fill="rgba(255,245,230,0.35)" />
    </svg>
  )
}

function HoneyDropSVG() {
  return (
    <svg width="12" height="18" viewBox="0 0 12 18" fill="none">
      <path d="M6 0 C2 4 0 8 0 11 C0 14.9 2.7 18 6 18 C9.3 18 12 14.9 12 11 C12 8 10 4 6 0Z"
        fill="rgba(200,140,20,0.5)" />
      <path d="M6 4 C4 7 3 9 3 11 C3 13.2 4.3 15 6 15 C7.7 15 9 13.2 9 11 C9 9 8 7 6 4Z"
        fill="rgba(240,180,40,0.35)" />
    </svg>
  )
}

function CrumbSVG() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
      <rect x="0" y="0" width="8" height="8" rx="2" fill="rgba(100,50,15,0.5)" transform="rotate(15 4 4)" />
    </svg>
  )
}

const DECO_SVGS: Record<DecorationType, () => JSX.Element> = {
  'choco-drip':  () => <ChocoDripSVG />,
  'choco-piece': () => <ChocoPieceSVG />,
  'berry':       () => <BerrySVG />,
  'cream-swirl': () => <CreamSwirlSVG />,
  'honey-drop':  () => <HoneyDropSVG />,
  'crumb':       () => <CrumbSVG />,
}

const DECO_ANIM: Record<DecorationType, string> = {
  'choco-drip':  'dp-drip',
  'choco-piece': 'dp-spin',
  'berry':       'dp-bounce',
  'cream-swirl': 'dp-float',
  'honey-drop':  'dp-drip',
  'crumb':       'dp-spin',
}

const DECO_DURATION: Record<DecorationType, string> = {
  'choco-drip':  '3.2s',
  'choco-piece': '5.5s',
  'berry':       '2.8s',
  'cream-swirl': '4s',
  'honey-drop':  '3.6s',
  'crumb':       '4.5s',
}

function DecorationsLayer({ decorations }: { decorations: DecorationType[] }) {
  const items: { type: DecorationType; posIdx: number; delay: string }[] = []
  let posCounter = 0
  decorations.forEach(type => {
    const count = type === 'choco-drip' ? 4 : type === 'choco-piece' ? 6 : type === 'crumb' ? 8 : 3
    for (let i = 0; i < count; i++) {
      items.push({ type, posIdx: posCounter++ % POSITIONS.length, delay: `${(i * 0.7).toFixed(1)}s` })
    }
  })

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {items.map(({ type, posIdx, delay }, idx) => {
        const Svg = DECO_SVGS[type]
        const pos = POSITIONS[posIdx]
        return (
          <div
            key={`${type}-${idx}`}
            style={{
              position: 'absolute',
              left: pos.left,
              top: pos.top,
              opacity: 0.7,
              animation: `${DECO_ANIM[type]} ${DECO_DURATION[type]} ${delay} ease-in-out infinite alternate`,
              willChange: 'transform',
            }}
          >
            <Svg />
          </div>
        )
      })}
    </div>
  )
}

// ─── Dessert image placeholder ─────────────────────────────────────────────────
function DessertPlaceholder({ size = 160 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size * 0.9} viewBox="0 0 180 162" fill="none"
        style={{ pointerEvents: 'none', userSelect: 'none' }}>
        {/* Plate */}
        <ellipse cx="90" cy="150" rx="80" ry="12" fill="rgba(255,255,255,0.12)" />
        {/* Cake bottom layer */}
        <rect x="18" y="110" width="144" height="38" rx="10" fill="rgba(255,255,255,0.18)" />
        <rect x="24" y="116" width="132" height="26" rx="7" fill="rgba(255,255,255,0.1)" />
        {/* Cake middle layer */}
        <rect x="30" y="74" width="120" height="38" rx="9" fill="rgba(255,255,255,0.22)" />
        <rect x="36" y="80" width="108" height="26" rx="6" fill="rgba(255,255,255,0.12)" />
        {/* Cake top layer */}
        <rect x="44" y="42" width="92" height="34" rx="8" fill="rgba(255,255,255,0.25)" />
        <rect x="50" y="48" width="80" height="22" rx="5" fill="rgba(255,255,255,0.14)" />
        {/* Cream top */}
        <path d="M44 42 Q58 22 90 20 Q122 22 136 42" fill="rgba(255,255,255,0.3)" />
        {/* Candle */}
        <rect x="87" y="14" width="6" height="18" rx="3" fill="rgba(255,200,150,0.7)" />
        <ellipse cx="90" cy="13" rx="4" ry="5" fill="rgba(255,180,60,0.85)" />
        <ellipse cx="90" cy="11" rx="2" ry="3" fill="rgba(255,240,180,0.9)" />
        {/* Drizzle lines */}
        <path d="M60 42 Q55 55 58 74" stroke="rgba(255,255,255,0.25)" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M110 42 Q118 55 114 74" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M80 110 Q72 125 76 148" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M100 110 Q108 125 104 148" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
      <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', fontWeight: 600 }}>
        Image Added Later
      </p>
    </div>
  )
}

// ─── Product panel (one dissolve unit) ───────────────────────────────────────
function ProductPanel({ dessert, dir, reducedMotion }: {
  dessert: typeof desserts[number]; dir: number; reducedMotion: boolean
}) {
  const variants = reducedMotion ? dissolveVReduced : dissolveV
  const placeholderSize = typeof window !== 'undefined' ? Math.min(180, Math.max(110, window.innerHeight * 0.26)) : 150

  return (
    <motion.div
      key={dessert.name} custom={dir} variants={variants}
      initial="enter" animate="center" exit="exit"
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', willChange: 'opacity, transform, filter' }}
    >
      {/* Decorations dissolve with product */}
      <DecorationsLayer decorations={dessert.decorations} />

      {/* Giant background word */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1 }}>
        <span style={{ fontSize: bgWordFontSize(dessert.shortName), fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: 'rgba(255,255,255,0.09)', whiteSpace: 'nowrap', userSelect: 'none' }}>
          {dessert.shortName}
        </span>
      </div>

      {/* Product grid */}
      <div className="dp-hero-grid" style={{ position: 'relative', zIndex: 2, flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 'clamp(12px,3vw,48px)', alignItems: 'center', maxWidth: 1180, width: '100%', margin: '0 auto', padding: 'clamp(8px,2vh,20px) clamp(56px,8vw,96px)' }}>
        {/* Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px,2vh,20px)' }}>
          <p style={{ margin: 0, fontSize: 'clamp(9px,1.1vw,12px)', fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Desserts</p>
          <h2 style={{ margin: 0, fontSize: 'clamp(26px,4.2vw,68px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.05 }}>{dessert.name}</h2>
          <p style={{ margin: 0, fontSize: 'clamp(13px,1.3vw,17px)', color: 'rgba(255,255,255,0.62)', lineHeight: 1.6, maxWidth: 340 }}>{dessert.description}</p>
          <p style={{ margin: 0, fontSize: 'clamp(24px,3.2vw,54px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>{dessert.price}</p>
        </div>
        {/* Image */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {dessert.image ? (
            <img src={dessert.image} alt={dessert.name} draggable={false}
              style={{ maxHeight: 'clamp(160px,36vh,400px)', objectFit: 'contain', filter: 'drop-shadow(0 24px 64px rgba(0,0,0,0.45))', userSelect: 'none' }} />
          ) : (
            <DessertPlaceholder size={placeholderSize} />
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
        <button key={i} onClick={() => onDot(i)} aria-label={`Dessert ${i + 1}`}
          style={{ width: i === active ? 28 : 8, height: 8, borderRadius: 4, background: i === active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.45s cubic-bezier(0.4,0,0.2,1)' }} />
      ))}
    </div>
  )
}

// ─── Hero view ────────────────────────────────────────────────────────────────
function HeroView({
  idx, dir, locked, reducedMotion,
  onPrev, onNext, onDot, onShowAll,
  onPointerDown, onPointerMove, onPointerUp, onPointerCancel,
}: {
  idx: number; dir: number; locked: boolean; reducedMotion: boolean
  onPrev: () => void; onNext: () => void; onDot: (i: number) => void; onShowAll: () => void
  onPointerDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
  onPointerCancel: () => void
}) {
  return (
    <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: CINEMATIC }}
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={onPointerUp} onPointerCancel={onPointerCancel}
      >
        <AnimatePresence custom={dir} mode="sync">
          <ProductPanel key={idx} dessert={desserts[idx]} dir={dir} reducedMotion={reducedMotion} />
        </AnimatePresence>
        <ArrowBtn dir="left" onClick={onPrev} disabled={locked} />
        <ArrowBtn dir="right" onClick={onNext} disabled={locked} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, paddingBottom: 'clamp(16px,3.5vh,32px)', zIndex: 10 }}>
        <Dots total={desserts.length} active={idx} onDot={onDot} />
        <button onClick={onShowAll}
          style={{ padding: '11px 30px', borderRadius: 999, background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.28)', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', cursor: 'pointer', transition: 'background 0.22s, transform 0.15s' }}
          onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
          onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >SHOW ALL DESSERTS</button>
      </div>
    </motion.div>
  )
}

// ─── All Desserts card ─────────────────────────────────────────────────────────
function DessertCard({ dessert, dist, cardW, cardH, onClick }: {
  dessert: typeof desserts[number]; dist: number; cardW: number; cardH: number; onClick: () => void
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
        background: `linear-gradient(150deg, ${dessert.themeColor}ee 0%, ${adjustColor(dessert.themeColor, 30)} 100%)`,
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
        {dessert.image ? (
          <img src={dessert.image} alt={dessert.name} draggable={false}
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', userSelect: 'none', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))' }} />
        ) : (
          <DessertPlaceholder size={Math.min(90, cardW * 0.38)} />
        )}
      </div>
      {/* Info */}
      <div style={{ padding: '16px 20px 20px', background: 'rgba(0,0,0,0.18)', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <p style={{ margin: 0, fontSize: 'clamp(14px,1.7vw,18px)', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{dessert.name}</p>
          <p style={{ margin: 0, marginLeft: 10, fontSize: 'clamp(14px,1.7vw,18px)', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{dessert.price}</p>
        </div>
        <p style={{ margin: 0, fontSize: 'clamp(11px,1.1vw,13px)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.45 }}>{dessert.description}</p>
      </div>
    </motion.div>
  )
}

// Slightly lighten a hex color for the card gradient
function adjustColor(hex: string, amount: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, ((n >> 16) & 0xff) + amount)
  const g = Math.min(255, ((n >> 8) & 0xff) + amount)
  const b = Math.min(255, (n & 0xff) + amount)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

// ─── All Desserts view (horizontal carousel) ──────────────────────────────────
function AllDessertsView({ initialIdx, onSelect, onBack }: {
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

  // Desktop shows ~2 cards (frac 0.46), mobile shows 1 (frac 0.82)
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

  const snap = useCallback((i: number) => setIdx(Math.max(0, Math.min(i, desserts.length - 1))), [])

  const onPD = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true; dragStartX.current = e.clientX; trackStart.current = trackX.get()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPM = (e: React.PointerEvent<HTMLDivElement>) => { if (!dragging.current) return; trackX.set(trackStart.current + (e.clientX - dragStartX.current)) }
  const onPU = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return; dragging.current = false
    const diff = e.clientX - dragStartX.current
    if (Math.abs(diff) > DRAG_THRESHOLD) snap(idx + (diff < 0 ? 1 : -1))
    else animate(trackX, getTarget(idx), { type: 'spring', stiffness: 300, damping: 30 })
  }
  const onPC = () => { dragging.current = false; animate(trackX, getTarget(idx), { type: 'spring', stiffness: 300, damping: 30 }) }
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 8) snap(idx + (e.deltaX > 0 ? 1 : -1)) }

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setIdx(i => Math.max(0, i - 1))
      else if (e.key === 'ArrowRight') setIdx(i => Math.min(desserts.length - 1, i + 1))
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
        onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU} onPointerCancel={onPC} onWheel={onWheel}
      >
        <motion.div style={{ x: trackX, display: 'flex', gap: GAP, userSelect: 'none' }}>
          {desserts.map((dessert, i) => (
            <DessertCard key={dessert.name} dessert={dessert} dist={i - idx} cardW={cardW} cardH={cardH}
              onClick={() => i === idx ? onSelect(i) : snap(i)} />
          ))}
        </motion.div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12 }}>
        {(['left', 'right'] as const).map(d => (
          <button key={d} onClick={() => snap(d === 'left' ? idx - 1 : idx + 1)}
            disabled={d === 'left' ? idx === 0 : idx === desserts.length - 1}
            style={{ width: 42, height: 42, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.16)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (d === 'left' ? idx === 0 : idx === desserts.length - 1) ? 0.35 : 1, transition: 'opacity 0.2s' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: d === 'right' ? 'scaleX(-1)' : 'none' }}><path d="M15 18l-6-6 6-6" /></svg>
          </button>
        ))}
      </div>
      <Dots total={desserts.length} active={idx} onDot={snap} />
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DessertsPage({ navigate }: { navigate: (to: NavRoute) => void }) {
  const [view, setView] = useState<View>('hero')
  const [heroIdx, setHeroIdx] = useState(0)
  const [dir, setDir] = useState(1)
  const [allInit, setAllInit] = useState(0)

  const locked = useRef(false)
  const pStartX = useRef<number | null>(null)
  const pStartY = useRef<number | null>(null)
  const isDrag = useRef(false)
  const reducedMotion = useRef(
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
  )

  const dessert = desserts[heroIdx]

  const paginate = useCallback((d: number) => {
    if (locked.current) return
    locked.current = true
    setDir(d)
    setHeroIdx(prev => (prev + d + desserts.length) % desserts.length)
    setTimeout(() => { locked.current = false }, LOCK_MS)
  }, [])

  const goTo = useCallback((i: number) => {
    if (locked.current || i === heroIdx) return
    locked.current = true; setDir(i > heroIdx ? 1 : -1); setHeroIdx(i)
    setTimeout(() => { locked.current = false }, LOCK_MS)
  }, [heroIdx])

  useEffect(() => {
    if (view !== 'hero') return
    const h = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') paginate(-1); else if (e.key === 'ArrowRight') paginate(1) }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [view, paginate])

  const onPD = useCallback((e: React.PointerEvent) => {
    if (view !== 'hero') return
    pStartX.current = e.clientX; pStartY.current = e.clientY; isDrag.current = false
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [view])
  const onPM = useCallback((e: React.PointerEvent) => {
    if (pStartX.current === null) return
    const dx = Math.abs(e.clientX - pStartX.current), dy = Math.abs(e.clientY - (pStartY.current ?? 0))
    if (dx > dy && dx > 8) isDrag.current = true
  }, [])
  const onPU = useCallback((e: React.PointerEvent) => {
    if (pStartX.current === null) return
    const diff = e.clientX - pStartX.current
    if (isDrag.current && Math.abs(diff) > DRAG_THRESHOLD) paginate(diff < 0 ? 1 : -1)
    pStartX.current = null; pStartY.current = null; isDrag.current = false
  }, [paginate])
  const onPC = useCallback(() => { pStartX.current = null; isDrag.current = false }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Animated background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundColor: dessert.themeColor, transition: 'background-color 0.75s cubic-bezier(0.4,0,0.2,1)' }} />
      {/* Warm center glow */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(200,100,30,0.06) 0%, transparent 80%)' }} />

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
            <HeroView key="hero" idx={heroIdx} dir={dir} locked={locked.current} reducedMotion={reducedMotion.current}
              onPrev={() => paginate(-1)} onNext={() => paginate(1)} onDot={goTo}
              onShowAll={() => { setAllInit(heroIdx); setView('all') }}
              onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU} onPointerCancel={onPC}
            />
          ) : (
            <AllDessertsView key="all" initialIdx={allInit}
              onSelect={(i) => { setHeroIdx(i); setView('hero') }}
              onBack={() => setView('hero')}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Decoration animation keyframes */}
      <style>{`
        @keyframes dp-float  { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-10px) rotate(4deg); } }
        @keyframes dp-drip   { 0%,100% { transform: translateY(0px) scaleY(1); }   50% { transform: translateY(7px) scaleY(1.12); } }
        @keyframes dp-spin   { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(1.05); } 100% { transform: rotate(360deg) scale(1); } }
        @keyframes dp-bounce { 0%,100% { transform: translateY(0) scale(1); }      50% { transform: translateY(-9px) scale(1.06); } }
        @media (max-width: 620px) {
          .dp-hero-grid { grid-template-columns: 1fr !important; }
          .dp-hero-grid > div:last-child { order: -1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dp-hero-grid [style*="animation"] { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
