import { motion } from 'framer-motion'
import OlivaLogo from './OlivaLogo'

type NavRoute = 'home' | 'menu' | 'cold-drinks' | 'desserts' | 'hot-drinks' | 'shisha'

// ─────────────────────────────────────────────────────────────────────────────
//  SHISHA — BACKGROUND IMAGE
//  Replace this URL with your own shisha background photo.
//  Recommended size: 1920×1080 or larger.
// ─────────────────────────────────────────────────────────────────────────────
const backgroundImage =
  'https://images.pexels.com/photos/1058277/pexels-photo-1058277.jpeg?auto=compress&cs=tinysrgb&w=1920'

// ─────────────────────────────────────────────────────────────────────────────
//  SHISHA — PRODUCT DATA
//  Edit ONLY this array to add, remove or update products.
//
//  • id          unique string key
//  • name        product name shown on the card
//  • description short tagline
//  • price       price string e.g. "$2.99"
//  • priceColor  hex color for the price text
//  • image       null = placeholder; replace with "/your-image.png" or a URL
// ─────────────────────────────────────────────────────────────────────────────
const shishaItems = [
  {
    id: 'hamed-naanaa',
    name: '7amed w na3na3',
    description: 'Fresh mint and lemon flavor.',
    price: '$2.99',
    priceColor: '#D4A017',
    image: null as string | null,
  },
  {
    id: 'tefe7ten',
    name: 'Tefe7ten',
    description: 'Classic double apple flavor.',
    price: '$2.99',
    priceColor: '#C62828',
    image: null as string | null,
  },
  {
    id: 'tanbak',
    name: 'Tanbak',
    description: 'Strong traditional tobacco flavor.',
    price: '$3.99',
    priceColor: '#8D6E63',
    image: null as string | null,
  },
]

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// ─── Image placeholder ────────────────────────────────────────────────────────
function ImagePlaceholder() {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 6,
    }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke="rgba(255,255,255,0.28)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <p style={{ margin: 0, fontSize: 8, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.26)', textTransform: 'uppercase', fontWeight: 600 }}>
        Image Soon
      </p>
    </div>
  )
}

// ─── Product card ─────────────────────────────────────────────────────────────
function ShishaCard({ item, index }: { item: typeof shishaItems[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, ease: EASE, delay: index * 0.1 }}
      whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(0,0,0,0.42)', transition: { duration: 0.22, ease: 'easeOut' } }}
      whileTap={{ scale: 0.985, transition: { duration: 0.12 } }}
      style={{
        display: 'flex', alignItems: 'center',
        gap: 'clamp(12px,2vw,20px)',
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(14px) saturate(1.3)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 20,
        padding: 'clamp(14px,2vh,22px) clamp(14px,2vw,22px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        flexShrink: 0,
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: 'clamp(64px,9vw,86px)', height: 'clamp(64px,9vw,86px)',
        flexShrink: 0, borderRadius: 14,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
      }}>
        {item.image ? (
          <img src={item.image} alt={item.name} draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <ImagePlaceholder />
        )}
      </div>

      {/* Name + description */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <p style={{
          margin: 0,
          fontSize: 'clamp(14px,1.6vw,19px)', fontWeight: 700,
          color: '#fff', lineHeight: 1.2, letterSpacing: '-0.01em',
        }}>
          {item.name}
        </p>
        <p style={{
          margin: 0,
          fontSize: 'clamp(11px,1vw,13px)', color: 'rgba(255,255,255,0.52)', lineHeight: 1.45,
        }}>
          {item.description}
        </p>
      </div>

      {/* Price */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: EASE, delay: index * 0.1 + 0.22 }}
        style={{
          margin: 0, flexShrink: 0,
          fontSize: 'clamp(20px,2.4vw,30px)', fontWeight: 900,
          color: item.priceColor,
          letterSpacing: '-0.02em', lineHeight: 1,
          textShadow: `0 0 22px ${item.priceColor}55`,
        }}
      >
        {item.price}
      </motion.p>
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ShishaPage({ navigate }: { navigate: (to: NavRoute) => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* ── Background ──────────────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {/* Photo layer — scaled so blur edges are clipped */}
        <motion.div
          initial={{ scale: 1.04 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: EASE }}
          style={{
            position: 'absolute', inset: '-6%',
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'blur(10px)',
          }}
        />
        {/* Premium dark overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(5,3,0,0.75) 0%, rgba(12,8,2,0.70) 100%)',
        }} />
        {/* Subtle warm vignette on edges */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.35) 100%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        style={{
          position: 'relative', zIndex: 10, flexShrink: 0, height: 62,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 clamp(16px,4vw,40px)',
        }}
      >
        {/* Back button — top-left, clearly visible */}
        <motion.button
          onClick={() => navigate('menu')}
          whileHover={{ x: -2, background: 'rgba(255,255,255,0.22)' }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.11)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.22)', borderRadius: 999,
            padding: '8px 18px', cursor: 'pointer',
            color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          MENU
        </motion.button>

        {/* Logo right */}
        <button onClick={() => navigate('home')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
          <OlivaLogo size={34} showText={false} />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: '0.06em', textShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
            OLIVA
          </span>
        </button>
      </motion.nav>

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <div className="sp-main" style={{
        flex: 1, position: 'relative', zIndex: 2,
        display: 'flex', overflow: 'hidden',
        padding: 'clamp(14px,2.5vh,32px) clamp(16px,4vw,52px) clamp(16px,2.5vh,28px)',
        gap: 'clamp(20px,4vw,60px)',
        minHeight: 0,
      }}>

        {/* ── Hero column ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: EASE, delay: 0.1 }}
          className="sp-hero"
          style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {/* Eyebrow label */}
          <p style={{
            margin: '0 0 clamp(8px,1.2vh,14px)',
            fontSize: 'clamp(9px,1vw,11px)', fontWeight: 700, letterSpacing: '0.38em',
            color: 'rgba(255,255,255,0.42)', textTransform: 'uppercase',
          }}>
            Café &amp; Lounge
          </p>

          {/* Title */}
          <h1 style={{
            margin: '0 0 clamp(8px,1.2vh,14px)',
            fontSize: 'clamp(44px,7vw,96px)', fontWeight: 900,
            letterSpacing: '-0.04em', lineHeight: 0.93,
            color: '#fff', textShadow: '0 4px 28px rgba(0,0,0,0.45)',
          }}>
            SHISHA
          </h1>

          {/* Gold accent underline */}
          <div style={{
            width: 'clamp(36px,4vw,54px)', height: 3, borderRadius: 2,
            background: 'linear-gradient(90deg,#D4A017,#f5c540)',
            marginBottom: 'clamp(10px,1.6vh,20px)',
          }} />

          {/* Subtitle */}
          <p style={{
            margin: '0 0 clamp(16px,2.8vh,36px)',
            fontSize: 'clamp(13px,1.3vw,17px)',
            color: 'rgba(255,255,255,0.62)', lineHeight: 1.6,
            maxWidth: 270,
          }}>
            Relax and enjoy your favorite flavor.
          </p>

          {/* Starting price */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.38 }}
          >
            <p style={{
              margin: '0 0 4px',
              fontSize: 'clamp(9px,0.9vw,10px)', fontWeight: 700,
              letterSpacing: '0.3em', color: 'rgba(212,160,23,0.65)', textTransform: 'uppercase',
            }}>
              Starting from
            </p>
            <p style={{
              margin: 0,
              fontSize: 'clamp(30px,5vw,64px)', fontWeight: 900,
              letterSpacing: '-0.03em', lineHeight: 1,
              color: '#D4A017',
              textShadow: '0 0 40px rgba(212,160,23,0.5), 0 2px 14px rgba(0,0,0,0.35)',
            }}>
              $2.99
            </p>
          </motion.div>
        </motion.div>

        {/* ── Products column ───────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Section label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              margin: 0, flexShrink: 0,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.3em',
              color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase',
            }}
          >
            Our Flavors
          </motion.p>

          {/* Scrollable cards area */}
          <div className="sp-scroll" style={{
            flex: 1, minHeight: 0,
            overflowY: 'auto', overflowX: 'hidden',
            display: 'flex', flexDirection: 'column',
            gap: 'clamp(10px,1.8vh,16px)',
            paddingRight: 2,
          }}>
            {shishaItems.map((item, i) => (
              <ShishaCard key={item.id} item={item} index={i} />
            ))}
            {/* Bottom breathing room */}
            <div style={{ height: 8, flexShrink: 0 }} />
          </div>
        </div>
      </div>

      <style>{`
        /* Desktop: two columns side by side */
        .sp-main { flex-direction: row; align-items: center; }
        .sp-hero { width: clamp(240px, 38vw, 400px); }

        /* Mobile: stack hero above cards */
        @media (max-width: 640px) {
          .sp-main  { flex-direction: column; align-items: stretch; }
          .sp-hero  { width: 100% !important; justify-content: flex-start; flex-shrink: 0; }
        }

        /* Hide scrollbar — keep scroll */
        .sp-scroll::-webkit-scrollbar { display: none; }
        .sp-scroll { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
    </div>
  )
}
