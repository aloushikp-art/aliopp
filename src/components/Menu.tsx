import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

type SectionId = 'hot' | 'cold' | 'dessert' | 'shisha'

interface MenuItem {
  name: string
  price: string
  desc: string
}

interface Section {
  id: SectionId
  label: string
  icon: string
  gradient: string
  border: string
  textColor: string
  glowColor: string
  items: MenuItem[]
  parts: { ch: string; c: string; x: string; y: string }[]
}

const SECTIONS: Section[] = [
  {
    id: 'hot',
    label: 'Hot Drinks',
    icon: '☕',
    gradient: 'linear-gradient(135deg,#dc2626,#f97316)',
    border: '#991b1b',
    textColor: '#b91c1c',
    glowColor: 'rgba(220,38,38,0.4)',
    items: [
      { name: 'Espresso', price: '$3', desc: 'Rich single-origin shot' },
      { name: 'Cappuccino', price: '$4.5', desc: 'Velvety foam over espresso' },
      { name: 'Latte', price: '$4.5', desc: 'Smooth espresso with steamed milk' },
      { name: 'Turkish Coffee', price: '$3.5', desc: 'Traditional, bold & aromatic' },
    ],
    parts: [
      { ch: '♨️', c: 'pst1', x: '18%', y: '16%' },
      { ch: '♨️', c: 'pst2', x: '48%', y: '12%' },
      { ch: '♨️', c: 'pst3', x: '74%', y: '18%' },
    ],
  },
  {
    id: 'cold',
    label: 'Cold Drinks',
    icon: '🥤',
    gradient: 'linear-gradient(135deg,#60a5fa,#3b82f6)',
    border: '#1d4ed8',
    textColor: '#2563eb',
    glowColor: 'rgba(59,130,246,0.4)',
    items: [
      { name: 'Iced Latte', price: '$5', desc: 'Chilled espresso with milk' },
      { name: 'Fresh Orange Juice', price: '$4', desc: 'Hand-squeezed daily' },
      { name: 'Mango Smoothie', price: '$5.5', desc: 'Fresh mango, yogurt, honey' },
      { name: 'Iced Tea', price: '$3.5', desc: 'Lemon or peach, refreshing' },
    ],
    parts: [
      { ch: '❄️', c: 'pa1', x: '10%', y: '16%' },
      { ch: '💧', c: 'pa2', x: '30%', y: '12%' },
      { ch: '🫧', c: 'pa3', x: '60%', y: '18%' },
      { ch: '❄️', c: 'pa4', x: '80%', y: '10%' },
    ],
  },
  {
    id: 'dessert',
    label: 'Dessert',
    icon: '🍰',
    gradient: 'linear-gradient(135deg,#d4a574,#8b6f47)',
    border: '#6b5237',
    textColor: '#8b6f47',
    glowColor: 'rgba(139,111,71,0.4)',
    items: [
      { name: 'Chocolate Lava Cake', price: '$6', desc: 'Warm center, vanilla ice cream' },
      { name: 'Tiramisu', price: '$5.5', desc: 'Coffee-soaked layers, mascarpone' },
      { name: 'Cheesecake', price: '$5', desc: 'New York style, berry compote' },
      { name: 'Milk Pudding', price: '$4', desc: 'Silky smooth, caramel topping' },
    ],
    parts: [
      { ch: '✨', c: 'pa1', x: '10%', y: '18%' },
      { ch: '💖', c: 'pa2', x: '32%', y: '12%' },
      { ch: '⭐', c: 'pa3', x: '62%', y: '18%' },
      { ch: '✨', c: 'pa4', x: '82%', y: '14%' },
    ],
  },
  {
    id: 'shisha',
    label: 'Shisha',
    icon: '💨',
    gradient: 'linear-gradient(135deg,#84cc16,#65a30d)',
    border: '#4d7c0f',
    textColor: '#65a30d',
    glowColor: 'rgba(132,204,22,0.4)',
    items: [
      { name: 'Mint Breeze', price: '$12', desc: 'Cool refreshing mint' },
      { name: 'Double Apple', price: '$12', desc: 'Classic sweet apple blend' },
      { name: 'Blue Mist', price: '$13', desc: 'Blueberry with a icy finish' },
      { name: 'Watermelon Wave', price: '$13', desc: 'Juicy watermelon, light & sweet' },
    ],
    parts: [
      { ch: '💨', c: 'psk1', x: '14%', y: '16%' },
      { ch: '💨', c: 'psk2', x: '46%', y: '10%' },
      { ch: '💨', c: 'psk3', x: '72%', y: '18%' },
    ],
  },
]

export default function Menu({ onBack }: { onBack?: () => void }) {
  const [hovered, setHovered] = useState<SectionId | null>(null)
  const sectionRefs = useRef<Record<SectionId, HTMLDivElement | null>>({
    hot: null, cold: null, dessert: null, shisha: null,
  })

  const scrollToSection = (id: SectionId) => {
    const el = sectionRefs.current[id]
    if (el) {
      const offset = 80
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <section id="menu" className="py-24 bg-stone-50 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-olive-600 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
        )}

        {/* Title */}
        <div className="text-center mb-10">
          <p className="text-olive-600 text-sm font-semibold tracking-[0.3em] uppercase mb-3">Café & Kitchen</p>
          <h2 className="text-4xl font-bold text-stone-800">Our Menu</h2>
          <div className="w-16 h-1 bg-olive-600 rounded-full mx-auto mt-4" />
        </div>

        {/* Shortcut buttons — compact rectangular category cards */}
        <div className="flex flex-wrap items-stretch justify-center gap-3 mb-16">
          {SECTIONS.map((sec) => (
            <motion.button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              onMouseEnter={() => setHovered(sec.id)}
              onMouseLeave={() => setHovered(null)}
              className={hovered === sec.id ? 'aglow' : ''}
              style={{
                position: 'relative',
                overflow: 'hidden',
                background: sec.gradient,
                border: `2px solid ${sec.border}`,
                borderRadius: '14px',
                padding: '14px 20px',
                minHeight: '72px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                flex: '1 1 130px',
                maxWidth: '180px',
                boxShadow: hovered === sec.id
                  ? `0 0 30px ${sec.glowColor}, 0 8px 30px rgba(0,0,0,.55)`
                  : '0 4px 22px rgba(0,0,0,.45)',
                '--gc': sec.glowColor,
              } as React.CSSProperties}
              whileHover={{ scale: 1.06, y: -6 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            >
              {sec.parts.map((p, i) => (
                <span key={i} className={p.c} style={{ left: p.x, bottom: p.y }}>
                  {p.ch}
                </span>
              ))}
              <span style={{
                fontSize: '1.8rem',
                lineHeight: 1,
                filter: `drop-shadow(0 0 10px ${sec.glowColor})`,
                position: 'relative',
                zIndex: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {sec.id === 'cold' ? (
                  <img
                    src="/cold-drinks.png"
                    alt="Cold Drinks"
                    style={{ width: '30px', height: '46px', objectFit: 'contain' }}
                  />
                ) : sec.id === 'dessert' ? (
                  <img
                    src="/dessert.png"
                    alt="Dessert"
                    style={{ width: '46px', height: '46px', objectFit: 'contain' }}
                  />
                ) : sec.id === 'hot' ? (
                  <img
                    src="/hot-drinks.png"
                    alt="Hot Drinks"
                    style={{ width: '46px', height: '46px', objectFit: 'contain' }}
                  />
                ) : (
                  sec.icon
                )}
              </span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '1px',
                textShadow: `0 0 14px ${sec.glowColor}`,
                position: 'relative',
                zIndex: 3,
                whiteSpace: 'nowrap',
              }}>
                {sec.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-20">
          {SECTIONS.map((sec) => (
            <div key={sec.id} ref={(el) => { sectionRefs.current[sec.id] = el }} id={`menu-${sec.id}`}>
              {/* Animated section header */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="flex items-center gap-4 mb-8"
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: '56px', height: '56px', borderRadius: '16px',
                    background: sec.gradient, fontSize: '28px',
                    boxShadow: `0 4px 16px ${sec.glowColor}`,
                    border: `2px solid ${sec.border}`,
                  }}
                >
                  {sec.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold" style={{ color: sec.textColor }}>{sec.label}</h3>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '60px' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                    className="h-1 rounded-full mt-1"
                    style={{ background: sec.gradient }}
                  />
                </div>
              </motion.div>

              {/* Image placeholder + items grid */}
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Image placeholder */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 aspect-[4/3] hover:scale-[1.02] transition-transform duration-300"
                  style={{ borderColor: `${sec.textColor}40`, background: `${sec.textColor}08` }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: '48px', height: '48px', borderRadius: '12px',
                      background: `${sec.textColor}15`, fontSize: '24px',
                    }}
                  >
                    {sec.icon}
                  </div>
                  <p className="text-sm font-medium" style={{ color: `${sec.textColor}99` }}>Add {sec.label} image</p>
                  <p className="text-xs text-stone-400">Recommended: 600 × 450px</p>
                </motion.div>

                {/* Items */}
                <div className="space-y-4">
                  {sec.items.map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.3, delay: i * 0.08 }}
                      className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-stone-100"
                      style={{ borderLeft: `3px solid ${sec.textColor}` }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-base font-semibold text-stone-800">{item.name}</h4>
                        <span className="text-base font-bold" style={{ color: sec.textColor }}>{item.price}</span>
                      </div>
                      <p className="text-sm text-stone-500">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
