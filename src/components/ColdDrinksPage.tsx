import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { coldDrinks } from '../data/coldDrinks'
import OlivaLogo from './OlivaLogo'

// ── Navigation ─────────────────────────────────────────────────────────────
type NavRoute = 'home' | 'menu' | 'cold-drinks'

const TRANSITION = { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const }

// ── Cup placeholder ────────────────────────────────────────────────────────
function CupPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <svg
        width="180"
        height="240"
        viewBox="0 0 180 240"
        fill="none"
        className="drop-shadow-2xl"
      >
        {/* Lid */}
        <ellipse cx="90" cy="30" rx="70" ry="14" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
        <rect x="20" y="22" width="140" height="12" rx="6" fill="rgba(255,255,255,0.15)" />
        {/* Straw */}
        <rect x="100" y="0" width="10" height="40" rx="5" fill="rgba(255,255,255,0.4)" />
        {/* Cup body */}
        <path
          d="M30 36 L40 220 Q40 235 55 235 L125 235 Q140 235 140 220 L150 36 Z"
          fill="rgba(255,255,255,0.12)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
        />
        {/* Ice cubes */}
        <rect x="55" y="80" width="24" height="24" rx="4" fill="rgba(255,255,255,0.2)" transform="rotate(15 67 92)" />
        <rect x="85" y="110" width="22" height="22" rx="4" fill="rgba(255,255,255,0.15)" transform="rotate(-10 96 121)" />
        <rect x="60" y="140" width="20" height="20" rx="4" fill="rgba(255,255,255,0.18)" transform="rotate(25 70 150)" />
      </svg>
      <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/50">
        Product Image Added Later
      </p>
    </div>
  )
}

// ── Arrow button ───────────────────────────────────────────────────────────
function ArrowButton({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={direction === 'left' ? 'Previous product' : 'Next product'}
      className="absolute top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/15 backdrop-blur-md hover:bg-white/30 transition-colors duration-300 group"
      style={{ [direction === 'left' ? 'left' : 'right']: '8px' } as React.CSSProperties}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="group-hover:scale-110 transition-transform"
        style={{ transform: direction === 'left' ? 'none' : 'scaleX(-1)' }}
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function ColdDrinksPage({ navigate }: { navigate: (to: NavRoute) => void }) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [showAll, setShowAll] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const prefersReducedMotion = useRef(false)

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const product = coldDrinks[index]

  const paginate = useCallback((dir: number) => {
    setDirection(dir)
    setIndex((prev) => (prev + dir + coldDrinks.length) % coldDrinks.length)
  }, [])

  const goTo = useCallback((i: number) => {
    setDirection(i > index ? 1 : -1)
    setIndex(i)
  }, [index])

  // Keyboard arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showAll) return
      if (e.key === 'ArrowLeft') paginate(-1)
      else if (e.key === 'ArrowRight') paginate(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [paginate, showAll])

  const scrollToGrid = () => {
    setShowAll(true)
    setTimeout(() => {
      gridRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 60)
  }

  const scrollToSlider = () => {
    sliderRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Touch / swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(diff) > 50) {
      paginate(diff > 0 ? -1 : 1)
    }
    touchStartX.current = null
  }

  const imageVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      rotate: dir > 0 ? 3 : -3,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotate: 0,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      rotate: dir > 0 ? -3 : 3,
      scale: 0.95,
    }),
  }

  const textVariants = {
    enter: (dir: number) => ({
      y: dir > 0 ? 30 : -20,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      y: dir > 0 ? -20 : 30,
      opacity: 0,
    }),
  }

  const bgTextVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ── Top bar: logo + nav ─────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <OlivaLogo size={40} showText={false} />
          <span className="text-white font-bold text-lg tracking-wide" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            OLIVA
          </span>
        </button>
        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => navigate('home')} className="text-sm font-medium text-white/80 hover:text-white transition-colors">Home</button>
          <button onClick={() => navigate('menu')} className="text-sm font-medium text-white/80 hover:text-white transition-colors">Menu</button>
          <button
            onClick={() => navigate('home')}
            className="text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            Contact
          </button>
        </div>
        <button
          onClick={() => navigate('menu')}
          className="md:hidden p-2 text-white"
          aria-label="Back to menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* ── Full-screen slider ───────────────────────────────────────────── */}
      <section
        ref={sliderRef}
        className="relative min-h-screen flex items-center overflow-hidden transition-colors duration-700"
        style={{ backgroundColor: product.bgColor }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Giant transparent background product name */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.h1
              key={`bg-${index}`}
              custom={direction}
              variants={bgTextVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[18vw] sm:text-[16vw] lg:text-[14vw] font-black text-white/10 leading-none whitespace-nowrap select-none tracking-tight"
              style={{ position: 'absolute' }}
            >
              {product.name.toUpperCase()}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Arrows */}
        <ArrowButton direction="left" onClick={() => paginate(-1)} />
        <ArrowButton direction="right" onClick={() => paginate(1)} />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pt-16 pb-32">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: text info */}
            <div className="order-2 lg:order-1 text-center lg:text-left">
              <AnimatePresence mode="popLayout" custom={direction}>
                <motion.div
                  key={`text-${index}`}
                  custom={direction}
                  variants={textVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={TRANSITION}
                  className="space-y-4"
                >
                  <p className="text-sm font-semibold tracking-[0.3em] uppercase text-white/60">
                    Cold Drinks
                  </p>
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                    {product.name}
                  </h2>
                  <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-md mx-auto lg:mx-0">
                    {product.description}
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold text-white">
                    {product.price}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: product image / placeholder */}
            <div className="order-1 lg:order-2 flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
              <AnimatePresence mode="popLayout" custom={direction}>
                <motion.div
                  key={`img-${index}`}
                  custom={direction}
                  variants={imageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={TRANSITION}
                  className="flex items-center justify-center"
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-[400px] lg:max-h-[500px] object-contain drop-shadow-2xl"
                    />
                  ) : (
                    <CupPlaceholder />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Pagination dots */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
          {coldDrinks.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to product ${i + 1}`}
              className="transition-all duration-500"
              style={{
                width: i === index ? '28px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: i === index ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
              }}
            />
          ))}
        </div>

        {/* Show All button */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={scrollToGrid}
            className="px-8 py-3.5 rounded-full bg-white/15 backdrop-blur-md text-white text-sm font-semibold tracking-wide border border-white/30 hover:bg-white/25 transition-all duration-300 hover:scale-105"
          >
            SHOW ALL COLD DRINKS
          </button>
        </div>
      </section>

      {/* ── Full menu grid ───────────────────────────────────────────────── */}
      <section ref={gridRef} className="py-20 sm:py-28 bg-stone-50 scroll-mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Back button */}
          <div className="text-center mb-12">
            <button
              onClick={scrollToSlider}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-olive-600 hover:bg-olive-700 text-white text-sm font-semibold tracking-wide transition-all duration-300 hover:scale-105"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 15l-6-6-6 6" />
              </svg>
              BACK TO PRODUCT VIEW
            </button>
          </div>

          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-olive-600 tracking-[0.3em] uppercase mb-3">
              Cold Drinks
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-stone-800">
              All Cold Drinks
            </h2>
            <div className="w-16 h-1 bg-olive-600 rounded-full mx-auto mt-4" />
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {coldDrinks.map((drink, i) => (
              <motion.button
                key={drink.name}
                onClick={() => {
                  goTo(i)
                  scrollToSlider()
                }}
                className="text-left rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                style={{ backgroundColor: drink.bgColor }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: 'easeOut' }}
              >
                {/* Image area */}
                <div className="aspect-[4/3] flex items-center justify-center overflow-hidden relative">
                  {drink.image ? (
                    <img
                      src={drink.image}
                      alt={drink.name}
                      loading="lazy"
                      className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 group-hover:scale-105 transition-transform duration-500">
                      <svg width="100" height="130" viewBox="0 0 180 240" fill="none" className="opacity-90">
                        <ellipse cx="90" cy="30" rx="70" ry="14" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.45)" strokeWidth="2" />
                        <rect x="20" y="22" width="140" height="12" rx="6" fill="rgba(255,255,255,0.12)" />
                        <rect x="100" y="0" width="10" height="40" rx="5" fill="rgba(255,255,255,0.35)" />
                        <path
                          d="M30 36 L40 220 Q40 235 55 235 L125 235 Q140 235 140 220 L150 36 Z"
                          fill="rgba(255,255,255,0.1)"
                          stroke="rgba(255,255,255,0.35)"
                          strokeWidth="2"
                        />
                        <rect x="55" y="80" width="24" height="24" rx="4" fill="rgba(255,255,255,0.18)" transform="rotate(15 67 92)" />
                        <rect x="85" y="110" width="22" height="22" rx="4" fill="rgba(255,255,255,0.13)" transform="rotate(-10 96 121)" />
                      </svg>
                      <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/40 px-4 text-center">
                        Image Soon
                      </p>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 bg-white">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-stone-800">{drink.name}</h3>
                    <span className="text-lg font-bold" style={{ color: drink.bgColor }}>{drink.price}</span>
                  </div>
                  <p className="text-sm text-stone-500 leading-relaxed">{drink.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
