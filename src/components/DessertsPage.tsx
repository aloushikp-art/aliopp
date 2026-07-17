import {
  useState, useRef, useEffect, useCallback,
} from 'react'
import {
  motion, AnimatePresence,
} from 'framer-motion'
import { desserts, type DecorationType, type Dessert } from '../data/desserts'
import OlivaLogo from './OlivaLogo'

type View = 'hero' | 'all'
type NavRoute = 'home' | 'menu' | 'cold-drinks' | 'desserts'

// Cinematic easing — same feel as Cold Drinks
const CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1]
const EXIT_EASE: [number, number, number, number] = [0.4, 0, 0.8, 1]
const DRAG_THRESHOLD = 48
const LOCK_MS = 980

// ─── Color helpers ────────────────────────────────────────────────────────────
function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)) }
function toRgb(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16)
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff }
}
function toHex(r: number, g: number, b: number) {
  return '#' + ((1 << 24) | (clamp(r,0,255) << 16) | (clamp(g,0,255) << 8) | clamp(b,0,255)).toString(16).slice(1)
}
function shade(hex: string, amt: number) {
  const { r, g, b } = toRgb(hex)
  return toHex(r + amt, g + amt, b + amt)
}
function rgba(hex: string, a: number) {
  const { r, g, b } = toRgb(hex)
  return `rgba(${r},${g},${b},${a})`
}

// ─── Dissolve variants (cinematic, same quality as Cold Drinks) ────────────────
const dissolveV = {
  enter: (d: number) => ({
    opacity: 0, x: d > 0 ? 36 : -36, y: 8, scale: 0.96, rotate: d > 0 ? 2 : -2, filter: 'blur(9px)',
    transition: { duration: 0 },
  }),
  center: {
    opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, filter: 'blur(0px)',
    transition: {
      opacity: { duration: 0.66, ease: CINEMATIC, delay: 0.34 },
      x:       { duration: 0.66, ease: CINEMATIC, delay: 0.34 },
      y:       { duration: 0.66, ease: CINEMATIC, delay: 0.34 },
      scale:   { duration: 0.78, ease: CINEMATIC, delay: 0.28 },
      rotate:  { duration: 0.78, ease: CINEMATIC, delay: 0.28 },
      filter:  { duration: 0.78, ease: CINEMATIC, delay: 0.28 },
    },
  },
  exit: (d: number) => ({
    opacity: 0, x: d > 0 ? -34 : 34, y: -6, scale: 0.95, rotate: d > 0 ? -2 : 2, filter: 'blur(8px)',
    transition: {
      opacity: { duration: 0.44, ease: EXIT_EASE },
      x:       { duration: 0.44, ease: EXIT_EASE },
      y:       { duration: 0.44, ease: EXIT_EASE },
      scale:   { duration: 0.46, ease: EXIT_EASE },
      rotate:  { duration: 0.46, ease: EXIT_EASE },
      filter:  { duration: 0.4, ease: EXIT_EASE },
    },
  }),
}
const dissolveVReduced = {
  enter: { opacity: 0, transition: { duration: 0 } },
  center: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

// ─── Decorations: ingredient SVGs ──────────────────────────────────────────────
function ChocoDripSVG() {
  return (
    <svg width="18" height="26" viewBox="0 0 18 26" fill="none">
      <path d="M9 0 C3.5 0 0 4.5 0 9 Q0 18 9 26 Q18 18 18 9 C18 4.5 14.5 0 9 0Z" fill="rgba(74,38,16,0.6)" />
      <path d="M9 5 C6 5 4.5 7.5 4.5 9.5 Q4.5 15.5 9 21.5 Q13.5 15.5 13.5 9.5 C13.5 7.5 12 5 9 5Z" fill="rgba(120,64,26,0.4)" />
    </svg>
  )
}
function ChocoPieceSVG() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="1" y="1" width="18" height="18" rx="4" fill="rgba(70,32,10,0.55)" transform="rotate(18 10 10)" />
      <rect x="4.5" y="4.5" width="11" height="11" rx="2.5" fill="rgba(140,72,28,0.4)" transform="rotate(18 10 10)" />
    </svg>
  )
}
function BerrySVG() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
      <ellipse cx="8" cy="3" rx="2.6" ry="2.2" fill="rgba(60,90,30,0.65)" />
      <circle cx="8" cy="11.5" r="5.8" fill="rgba(186,40,52,0.6)" />
      <circle cx="6" cy="9.5" r="2.2" fill="rgba(230,96,108,0.45)" />
    </svg>
  )
}
function CreamSwirlSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 20 C5.5 20 2 16.5 3.2 12 C4.2 8.6 8 7.6 11 9 C14 7.6 17.8 8.6 18.8 12 C20 16.5 16.5 20 11 20Z" fill="rgba(255,246,232,0.7)" />
      <path d="M11 15.5 C8.4 15.5 6.8 13.8 7.4 12.2 C8 10.6 9.6 10 11 10.6 C12.4 10 14 10.6 14.6 12.2 C15.2 13.8 13.6 15.5 11 15.5Z" fill="rgba(255,252,245,0.55)" />
    </svg>
  )
}
function HoneyDropSVG() {
  return (
    <svg width="13" height="20" viewBox="0 0 13 20" fill="none">
      <path d="M6.5 0 C2.4 4.5 0 9 0 12 C0 16 3 20 6.5 20 C10 20 13 16 13 12 C13 9 10.6 4.5 6.5 0Z" fill="rgba(206,142,28,0.6)" />
      <path d="M6.5 4.5 C4.4 7.8 3.2 10 3.2 12 C3.2 14.4 4.6 16.5 6.5 16.5 C8.4 16.5 9.8 14.4 9.8 12 C9.8 10 8.6 7.8 6.5 4.5Z" fill="rgba(244,184,46,0.45)" />
    </svg>
  )
}
function CrumbSVG() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
      <rect x="0" y="0" width="9" height="9" rx="2.5" fill="rgba(110,60,20,0.55)" transform="rotate(18 4.5 4.5)" />
    </svg>
  )
}
function PistachioSVG() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
      <ellipse cx="8" cy="6" rx="7.5" ry="5" fill="rgba(150,170,80,0.6)" />
      <ellipse cx="8" cy="6" rx="5" ry="3.2" fill="rgba(196,214,128,0.55)" />
      <path d="M3 6 Q8 2 13 6" stroke="rgba(96,116,48,0.5)" strokeWidth="1" fill="none" />
    </svg>
  )
}
function CaramelSVG() {
  return (
    <svg width="26" height="14" viewBox="0 0 26 14" fill="none">
      <path d="M1 7 Q7 1 13 7 Q19 13 25 7" stroke="rgba(196,132,46,0.6)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M1 7 Q7 1 13 7 Q19 13 25 7" stroke="rgba(244,196,120,0.45)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
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
  'pistachio':   () => <PistachioSVG />,
  'caramel':     () => <CaramelSVG />,
}
const DECO_ANIM: Record<DecorationType, string> = {
  'choco-drip':  'dz-drip',
  'choco-piece': 'dz-spin',
  'berry':       'dz-bounce',
  'cream-swirl': 'dz-float',
  'honey-drop':  'dz-drip',
  'crumb':       'dz-spin',
  'pistachio':   'dz-float',
  'caramel':     'dz-float',
}
const DECO_DURATION: Record<DecorationType, string> = {
  'choco-drip':  '3.4s',
  'choco-piece': '5.8s',
  'berry':       '3s',
  'cream-swirl': '4.2s',
  'honey-drop':  '3.8s',
  'crumb':       '4.6s',
  'pistachio':   '4.4s',
  'caramel':     '5s',
}

// Positions scattered around the floating dessert area
const POSITIONS = [
  { left: '6%',  top: '16%' }, { left: '82%', top: '12%' },
  { left: '90%', top: '58%' }, { left: '10%', top: '70%' },
  { left: '46%', top: '8%'  }, { left: '70%', top: '82%' },
  { left: '22%', top: '44%' }, { left: '62%', top: '26%' },
  { left: '16%', top: '84%' }, { left: '84%', top: '40%' },
]

function DecorationsLayer({ dessert }: { dessert: Dessert }) {
  const items: { type: DecorationType; posIdx: number; delay: string }[] = []
  let posCounter = 0
  dessert.decorations.forEach(type => {
    const count = type === 'choco-drip' ? 3 : type === 'choco-piece' ? 5 : type === 'crumb' ? 7 : 3
    for (let i = 0; i < count; i++) {
      items.push({ type, posIdx: posCounter++ % POSITIONS.length, delay: `${(i * 0.7).toFixed(1)}s` })
    }
  })
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 3 }}>
      {items.map(({ type, posIdx, delay }, idx) => {
        const Svg = DECO_SVGS[type]
        const pos = POSITIONS[posIdx]
        return (
          <div key={`${type}-${idx}`}
            style={{
              position: 'absolute', left: pos.left, top: pos.top, opacity: 0.72,
              animation: `${DECO_ANIM[type]} ${DECO_DURATION[type]} ${delay} ease-in-out infinite alternate`,
              willChange: 'transform',
            }}>
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
        <ellipse cx="90" cy="150" rx="80" ry="12" fill="rgba(255,255,255,0.18)" />
        <rect x="18" y="110" width="144" height="38" rx="10" fill="rgba(255,255,255,0.28)" />
        <rect x="24" y="116" width="132" height="26" rx="7" fill="rgba(255,255,255,0.16)" />
        <rect x="30" y="74" width="120" height="38" rx="9" fill="rgba(255,255,255,0.32)" />
        <rect x="36" y="80" width="108" height="26" rx="6" fill="rgba(255,255,255,0.18)" />
        <rect x="44" y="42" width="92" height="34" rx="8" fill="rgba(255,255,255,0.36)" />
        <rect x="50" y="48" width="80" height="22" rx="5" fill="rgba(255,255,255,0.2)" />
        <path d="M44 42 Q58 22 90 20 Q122 22 136 42" fill="rgba(255,255,255,0.42)" />
        <rect x="87" y="14" width="6" height="18" rx="3" fill="rgba(255,200,150,0.8)" />
        <ellipse cx="90" cy="13" rx="4" ry="5" fill="rgba(255,180,60,0.9)" />
        <ellipse cx="90" cy="11" rx="2" ry="3" fill="rgba(255,240,180,0.95)" />
        <path d="M60 42 Q55 55 58 74" stroke="rgba(255,255,255,0.35)" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M110 42 Q118 55 114 74" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </svg>
      <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.15em', color: 'rgba(74,38,16,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>
        Image Added Later
      </p>
    </div>
  )
}

// ─── Curved chocolate wave (organic background shape) ─────────────────────────
function ChocoWave({ color, flip }: { color: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 760" preserveAspectRatio="none"
      style={{ position: 'absolute', width: '100%', height: '100%', display: 'block', transform: flip ? 'scaleX(-1)' : undefined }}
      aria-hidden
    >
      <path
        d="M0,520 C220,470 360,560 560,520 C780,470 920,600 1140,540 C1280,500 1380,560 1440,520 L1440,760 L0,760 Z"
        fill={color}
      />
    </svg>
  )
}

// ─── Product panel (one dissolve unit) ───────────────────────────────────────
function ProductPanel({ dessert, dir, reducedMotion }: {
  dessert: Dessert; dir: number; reducedMotion: boolean
}) {
  const variants = reducedMotion ? dissolveVReduced : dissolveV
  const placeholderSize = typeof window !== 'undefined' ? Math.min(220, Math.max(140, window.innerHeight * 0.32)) : 180
  const dark = shade(dessert.themeColor, -10)
  const light = shade(dessert.themeColor, 60)

  return (
    <motion.div
      key={dessert.name} custom={dir} variants={variants}
      initial="enter" animate="center" exit="exit"
      style={{ position: 'absolute', inset: 0, willChange: 'opacity, transform, filter' }}
    >
      {/* Decorations dissolve with product */}
      <DecorationsLayer dessert={dessert} />

      {/* Floating dessert composition */}
      <div className="dz-stage" style={{
        position: 'relative', zIndex: 4, height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(8px,2vh,18px) clamp(20px,5vw,60px)',
        gap: 'clamp(10px,2vh,22px)',
      }}>
        {/* Short background name — curved over the top */}
        <div style={{ position: 'absolute', top: 'clamp(10px,4vh,40px)', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none', zIndex: 1 }}>
          <span style={{
            fontSize: 'clamp(40px,11vw,150px)', fontWeight: 900, letterSpacing: '-0.03em',
            lineHeight: 1, color: rgba(dark, 0.16), whiteSpace: 'nowrap', userSelect: 'none',
            textTransform: 'uppercase',
          }}>{dessert.shortName}</span>
        </div>

        {/* Rounded product frame — the floating dessert area */}
        <div className="dz-frame" style={{
          position: 'relative', zIndex: 5,
          width: 'min(440px, 70vw)', height: 'min(440px, 56vh)',
          borderRadius: '50% 50% 46% 54% / 54% 48% 52% 46%',
          background: `radial-gradient(circle at 32% 28%, ${rgba(light, 0.95)} 0%, ${rgba(dessert.themeColor, 0.92)} 62%, ${rgba(dark, 0.96)} 100%)`,
          boxShadow: `0 40px 90px rgba(60,30,12,0.4), inset 0 8px 30px rgba(255,255,255,0.35), inset 0 -18px 40px rgba(60,30,12,0.25)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1.5px solid rgba(255,255,255,0.4)`,
        }}>
          {/* Soft inner highlight */}
          <div style={{ position: 'absolute', inset: '12%', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.4) 0%, transparent 55%)', pointerEvents: 'none' }} />
          {dessert.image ? (
            <img src={dessert.image} alt={dessert.name} draggable={false}
              style={{ maxHeight: '78%', maxWidth: '78%', objectFit: 'contain', filter: 'drop-shadow(0 18px 36px rgba(40,20,8,0.45))', userSelect: 'none', position: 'relative', zIndex: 2 }} />
          ) : (
            <div style={{ position: 'relative', zIndex: 2 }}><DessertPlaceholder size={placeholderSize} /></div>
          )}
        </div>

        {/* Product info card — cream, rounded, centered under the frame */}
        <div className="dz-info" style={{
          position: 'relative', zIndex: 6,
          maxWidth: 560, width: '100%',
          padding: 'clamp(16px,2.4vw,28px) clamp(20px,3vw,36px)',
          borderRadius: 'clamp(22px,3vw,34px)',
          background: 'linear-gradient(150deg, rgba(255,248,236,0.96) 0%, rgba(255,236,224,0.94) 100%)',
          boxShadow: '0 22px 60px rgba(60,30,12,0.22), inset 0 1px 0 rgba(255,255,255,0.6)',
          border: '1px solid rgba(255,255,255,0.7)',
          textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(6px,1vh,12px)',
        }}>
          <p style={{ margin: 0, fontSize: 'clamp(9px,1vw,11px)', fontWeight: 700, letterSpacing: '0.3em', color: rgba(dark, 0.7), textTransform: 'uppercase' }}>Desserts</p>
          <h2 style={{ margin: 0, fontSize: 'clamp(26px,4vw,52px)', fontWeight: 800, color: dark, letterSpacing: '-0.02em', lineHeight: 1.05 }}>{dessert.name}</h2>
          <p style={{ margin: 0, fontSize: 'clamp(13px,1.3vw,16px)', color: rgba(dark, 0.72), lineHeight: 1.55, maxWidth: 420 }}>{dessert.description}</p>
          <p style={{ margin: 0, fontSize: 'clamp(22px,3vw,40px)', fontWeight: 800, color: dessert.themeColor, letterSpacing: '-0.01em' }}>{dessert.price}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Arrow button — round, semi-transparent, dessert-styled ────────────────────
function ArrowBtn({ dir, onClick, disabled, tone }: { dir: 'left' | 'right'; onClick: () => void; disabled: boolean; tone: { bg: string; fg: string } }) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled}
      aria-label={dir === 'left' ? 'Previous dessert' : 'Next dessert'}
      onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}
      style={{
        position: 'absolute', top: '50%', transform: `translateY(-50%) scale(${hover && !disabled ? 1.08 : 1})`,
        [dir === 'left' ? 'left' : 'right']: 'clamp(8px,2vw,28px)', zIndex: 20,
        width: 'clamp(44px,5.5vw,58px)', height: 'clamp(44px,5.5vw,58px)', borderRadius: '50%',
        background: hover && !disabled ? tone.bg : 'rgba(255,248,236,0.55)',
        backdropFilter: 'blur(8px)',
        border: `1.5px solid ${tone.fg}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1,
        transition: 'background 0.25s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s', padding: 0,
        boxShadow: '0 8px 24px rgba(60,30,12,0.18)',
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={tone.fg} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: dir === 'right' ? 'scaleX(-1)' : 'none' }}>
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  )
}

// ─── Pagination dots ──────────────────────────────────────────────────────────
function Dots({ total, active, onDot, tone }: { total: number; active: number; onDot: (i: number) => void; tone: { fg: string } }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {Array.from({ length: total }, (_, i) => (
        <button key={i} onClick={() => onDot(i)} aria-label={`Dessert ${i + 1}`}
          style={{ width: i === active ? 30 : 9, height: 9, borderRadius: 5, background: i === active ? tone.fg : rgba(tone.fg, 0.4), border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.45s cubic-bezier(0.4,0,0.2,1)' }} />
      ))}
    </div>
  )
}

// ─── Hero view ────────────────────────────────────────────────────────────────
function HeroView({
  idx, dir, locked, reducedMotion, tone,
  onPrev, onNext, onDot, onShowAll,
  onPointerDown, onPointerMove, onPointerUp, onPointerCancel,
}: {
  idx: number; dir: number; locked: boolean; reducedMotion: boolean
  tone: { bg: string; fg: string }
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
        <ArrowBtn dir="left" onClick={onPrev} disabled={locked} tone={tone} />
        <ArrowBtn dir="right" onClick={onNext} disabled={locked} tone={tone} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, paddingBottom: 'clamp(14px,3vh,28px)', zIndex: 10 }}>
        <Dots total={desserts.length} active={idx} onDot={onDot} tone={tone} />
        <button onClick={onShowAll}
          style={{ padding: '12px 30px', borderRadius: 999, background: tone.bg, border: `1.5px solid ${tone.fg}`, color: tone.fg, fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', cursor: 'pointer', transition: 'background 0.22s, transform 0.15s, color 0.22s', boxShadow: '0 8px 24px rgba(60,30,12,0.18)' }}
          onMouseOver={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = tone.bg }}
          onMouseOut={e => { e.currentTarget.style.background = tone.bg; e.currentTarget.style.color = tone.fg }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >SHOW ALL DESSERTS</button>
      </div>
    </motion.div>
  )
}

// ─── All Desserts card (Top-Sellers style) ─────────────────────────────────────
function DessertCard({ dessert, dist, cardW, cardH, onClick }: {
  dessert: Dessert; dist: number; cardW: number; cardH: number; onClick: () => void
}) {
  const abs = Math.abs(dist)
  const isCenter = abs === 0
  const dark = shade(dessert.themeColor, -14)
  const light = shade(dessert.themeColor, 56)
  return (
    <motion.div
      animate={{ scale: isCenter ? 1 : abs === 1 ? 0.9 : 0.8, opacity: isCenter ? 1 : abs === 1 ? 0.7 : abs === 2 ? 0.32 : 0 }}
      transition={{ duration: 0.45, ease: CINEMATIC }}
      onClick={onClick}
      style={{
        width: cardW, height: cardH, flexShrink: 0,
        borderRadius: 30,
        background: `linear-gradient(160deg, ${rgba(light, 0.96)} 0%, ${rgba(dessert.themeColor, 0.96)} 58%, ${rgba(dark, 0.98)} 100%)`,
        border: `1.5px solid rgba(255,255,255,${isCenter ? 0.6 : 0.3})`,
        cursor: isCenter ? 'pointer' : 'default',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: isCenter ? '0 36px 80px rgba(60,30,12,0.4)' : '0 10px 28px rgba(60,30,12,0.22)',
        filter: abs > 1 ? 'blur(2px)' : 'none',
        transition: 'box-shadow 0.35s, filter 0.35s',
      }}
    >
      {/* Image area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '26px 22px 14px', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: '18px', borderRadius: '50% 50% 46% 54% / 54% 48% 52% 46%', background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.35) 0%, transparent 60%)', pointerEvents: 'none' }} />
        {dessert.image ? (
          <img src={dessert.image} alt={dessert.name} draggable={false}
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', userSelect: 'none', filter: 'drop-shadow(0 10px 26px rgba(40,20,8,0.4))', position: 'relative', zIndex: 2 }} />
        ) : (
          <div style={{ position: 'relative', zIndex: 2 }}><DessertPlaceholder size={Math.min(110, cardW * 0.42)} /></div>
        )}
      </div>
      {/* Info */}
      <div style={{ padding: '16px 22px 22px', background: 'rgba(255,248,236,0.92)', borderTop: '1px solid rgba(255,255,255,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <p style={{ margin: 0, fontSize: 'clamp(15px,1.7vw,19px)', fontWeight: 800, color: dark, lineHeight: 1.2 }}>{dessert.name}</p>
          <p style={{ margin: 0, marginLeft: 10, fontSize: 'clamp(15px,1.7vw,19px)', fontWeight: 800, color: dessert.themeColor, flexShrink: 0 }}>{dessert.price}</p>
        </div>
        <p style={{ margin: 0, fontSize: 'clamp(11px,1.1vw,13px)', color: rgba(dark, 0.7), lineHeight: 1.45 }}>{dessert.description}</p>
      </div>
    </motion.div>
  )
}

// ─── All Desserts view (Top-Sellers-style carousel) ───────────────────────────
function AllDessertsView({ initialIdx, onSelect, onBack, tone }: {
  initialIdx: number; onSelect: (i: number) => void; onBack: () => void; tone: { bg: string; fg: string }
}) {
  const [idx, setIdx] = useState(initialIdx)
  const containerRef = useRef<HTMLDivElement>(null)
  const [cw, setCw] = useState(0)
  const [ch, setCh] = useState(0)
  const trackX = useRef(0)
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
  const cardH = Math.min(520, Math.max(300, ch * 0.8))

  const getTarget = useCallback((i: number) => !cw ? 0 : cw / 2 - cardW / 2 - i * (cardW + GAP), [cw, cardW])

  useEffect(() => {
    if (!cw) return
    let raf = 0
    const start = trackX.current
    const end = getTarget(idx)
    const t0 = performance.now()
    const dur = 520
    const ease = (t: number) => 1 - Math.pow(1 - t, 3)
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur)
      trackX.current = start + (end - start) * ease(p)
      const el = trackRef.current; if (el) el.style.transform = `translateX(${trackX.current}px)`
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [idx, getTarget, cw])

  const trackRef = useRef<HTMLDivElement>(null)

  const snap = useCallback((i: number) => setIdx(Math.max(0, Math.min(i, desserts.length - 1))), [])

  const onPD = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true; dragStartX.current = e.clientX; trackStart.current = trackX.current
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPM = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    trackX.current = trackStart.current + (e.clientX - dragStartX.current)
    const el = trackRef.current; if (el) el.style.transform = `translateX(${trackX.current}px)`
  }
  const onPU = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return; dragging.current = false
    const diff = e.clientX - dragStartX.current
    if (Math.abs(diff) > DRAG_THRESHOLD) snap(idx + (diff < 0 ? 1 : -1))
    else {
      const end = getTarget(idx)
      const el = trackRef.current; if (el) el.style.transform = `translateX(${end}px)`
      trackX.current = end
    }
  }
  const onPC = () => {
    dragging.current = false
    const end = getTarget(idx)
    const el = trackRef.current; if (el) el.style.transform = `translateX(${end}px)`
    trackX.current = end
  }
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
      <motion.button initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.42, ease: CINEMATIC }}
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 999, background: 'rgba(255,248,236,0.9)', border: `1.5px solid ${tone.fg}`, color: tone.fg, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', transition: 'background 0.2s' }}
        onMouseOver={e => (e.currentTarget.style.background = 'transparent')}
        onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,248,236,0.9)')}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
        BACK TO PRODUCT VIEW
      </motion.button>

      <div ref={containerRef}
        style={{ flex: 1, width: '100%', overflow: 'hidden', cursor: 'grab', touchAction: 'pan-y', display: 'flex', alignItems: 'center' }}
        onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU} onPointerCancel={onPC} onWheel={onWheel}
      >
        <div ref={trackRef} style={{ display: 'flex', gap: GAP, userSelect: 'none', willChange: 'transform' }}>
          {desserts.map((dessert, i) => (
            <DessertCard key={dessert.name} dessert={dessert} dist={i - idx} cardW={cardW} cardH={cardH}
              onClick={() => i === idx ? onSelect(i) : snap(i)} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        {(['left', 'right'] as const).map(d => (
          <button key={d} onClick={() => snap(d === 'left' ? idx - 1 : idx + 1)}
            disabled={d === 'left' ? idx === 0 : idx === desserts.length - 1}
            style={{ width: 46, height: 46, borderRadius: '50%', border: `1.5px solid ${tone.fg}`, background: 'rgba(255,248,236,0.8)', color: tone.fg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (d === 'left' ? idx === 0 : idx === desserts.length - 1) ? 0.35 : 1, transition: 'opacity 0.2s' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: d === 'right' ? 'scaleX(-1)' : 'none' }}><path d="M15 18l-6-6 6-6" /></svg>
          </button>
        ))}
      </div>
      <Dots total={desserts.length} active={idx} onDot={snap} tone={tone} />
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
  // Tone derived from current dessert — used for arrows, dots, buttons
  const tone = { bg: shade(dessert.themeColor, 60), fg: shade(dessert.themeColor, -8) }

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

  // Cream + pink canvas colors (constant dessert identity)
  const cream = '#FBF1E2'
  const softPink = '#F7E2DE'
  const choco = shade(dessert.themeColor, -6)

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Cream canvas with soft pink corner */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: `linear-gradient(135deg, ${cream} 0%, ${softPink} 100%)`, transition: 'background 0.8s cubic-bezier(0.4,0,0.2,1)' }} />

      {/* Soft pink organic blob (top-right) */}
      <div style={{ position: 'absolute', top: '-12%', right: '-8%', width: '46vw', height: '46vw', maxWidth: 520, maxHeight: 520, borderRadius: '50% 42% 58% 48% / 48% 58% 42% 52%', background: rgba(shade(dessert.themeColor, 70), 0.5), filter: 'blur(8px)', zIndex: 1, transition: 'background 0.8s cubic-bezier(0.4,0,0.2,1)', pointerEvents: 'none' }} />

      {/* Curved chocolate wave at the bottom — color blends with active dessert */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '46%', zIndex: 2, pointerEvents: 'none' }}>
        <ChocoWave color={rgba(choco, 0.92)} />
      </div>
      {/* Second wave, lighter, offset */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '32%', zIndex: 2, pointerEvents: 'none', opacity: 0.6 }}>
        <ChocoWave color={rgba(shade(dessert.themeColor, 30), 0.5)} flip />
      </div>

      {/* Nav */}
      <nav style={{ position: 'relative', zIndex: 10, height: 64, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(16px,4vw,40px)' }}>
        <button onClick={() => navigate('home')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer' }}>
          <OlivaLogo size={38} showText={false} />
          <span style={{ color: shade(dessert.themeColor, -20), fontWeight: 800, fontSize: 17, letterSpacing: '0.05em' }}>OLIVA</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px,3vw,28px)' }}>
          {(['Home', 'Menu'] as const).map(label => (
            <button key={label} onClick={() => navigate(label.toLowerCase() as NavRoute)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: rgba(shade(dessert.themeColor, -20), 0.78), fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', transition: 'color 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.color = shade(dessert.themeColor, -30))}
              onMouseOut={e => (e.currentTarget.style.color = rgba(shade(dessert.themeColor, -20), 0.78))}
            >{label}</button>
          ))}
          <button onClick={() => navigate('menu')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, background: tone.bg, border: `1.5px solid ${tone.fg}`, color: tone.fg, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer', transition: 'background 0.2s, color 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = tone.bg }}
            onMouseOut={e => { e.currentTarget.style.background = tone.bg; e.currentTarget.style.color = tone.fg }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Menu
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, position: 'relative', zIndex: 5 }}>
        <AnimatePresence mode="wait">
          {view === 'hero' ? (
            <HeroView key="hero" idx={heroIdx} dir={dir} locked={locked.current} reducedMotion={reducedMotion.current} tone={tone}
              onPrev={() => paginate(-1)} onNext={() => paginate(1)} onDot={goTo}
              onShowAll={() => { setAllInit(heroIdx); setView('all') }}
              onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU} onPointerCancel={onPC}
            />
          ) : (
            <AllDessertsView key="all" initialIdx={allInit} tone={tone}
              onSelect={(i) => { setHeroIdx(i); setView('hero') }}
              onBack={() => setView('hero')}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Decoration animation keyframes */}
      <style>{`
        @keyframes dz-float  { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-12px) rotate(5deg); } }
        @keyframes dz-drip   { 0%,100% { transform: translateY(0px) scaleY(1); }   50% { transform: translateY(8px) scaleY(1.14); } }
        @keyframes dz-spin   { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(1.06); } 100% { transform: rotate(360deg) scale(1); } }
        @keyframes dz-bounce { 0%,100% { transform: translateY(0) scale(1); }      50% { transform: translateY(-10px) scale(1.07); } }
        @media (max-width: 720px) {
          .dz-stage { gap: 12px !important; }
          .dz-frame { width: 78vw !important; height: 44vh !important; }
          .dz-info  { padding: 14px 18px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dz-stage [style*="animation"] { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
