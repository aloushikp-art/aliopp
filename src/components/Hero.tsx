import GlassyMenuButton from './GlassyMenuButton';

export default function Hero({ onViewMenu }: { onViewMenu: () => void }) {
  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full text-center py-20">
        <div className="space-y-8 animate-fade-up flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-olive-600/10 rounded-full">
            <span className="w-2 h-2 rounded-full bg-olive-600 animate-pulse" />
            <span className="text-sm font-medium text-olive-600 tracking-wide">Now Open · Padel + Café</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-stone-800 leading-tight">
            From <span className="text-olive-600">Court</span><br />to <span className="text-olive-600">Cup</span>
          </h1>
          <p className="text-lg text-stone-500 leading-relaxed max-w-md">
            Two premium padel courts, a cozy café, a kids zone, and a giant screen. Everything you need for the perfect day out.
          </p>
          <div className="pt-4">
            <GlassyMenuButton onClick={onViewMenu} />
          </div>
        </div>
      </div>
    </section>
  );
}
