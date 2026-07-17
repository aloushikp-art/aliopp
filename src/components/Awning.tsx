export default function Awning() {
  return (
    <div className="relative w-full select-none pointer-events-none" aria-hidden>
      {/* Top mounting bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-stone-800/40 z-30" />

      {/* Awning body */}
      <div className="relative">
        {/* Subtle shadow under awning */}
        <div
          className="absolute -bottom-3 left-0 right-0 h-6 opacity-30 blur-md"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)' }}
        />

        {/* Main awning SVG */}
        <svg
          viewBox="0 0 1200 200"
          className="w-full h-auto block"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Fabric gradient — dark green with realistic shading */}
            <linearGradient id="awningFabric" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2f5a3a" />
              <stop offset="40%" stopColor="#234a2e" />
              <stop offset="100%" stopColor="#1a3a23" />
            </linearGradient>

            {/* Front flap gradient — slightly darker at bottom */}
            <linearGradient id="flapFabric" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2f5a3a" />
              <stop offset="100%" stopColor="#163020" />
            </linearGradient>

            {/* Soft shadow filter */}
            <filter id="softShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
              <feOffset dx="0" dy="3" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.35" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Fabric texture — subtle stripes for realism */}
            <pattern id="fabricTexture" x="0" y="0" width="40" height="8" patternUnits="userSpaceOnUse">
              <rect width="40" height="8" fill="transparent" />
              <line x1="0" y1="0" x2="40" y2="0" stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Upper fixed section (the flat top part) */}
          <g filter="url(#softShadow)">
            <rect x="0" y="0" width="1200" height="40" fill="url(#awningFabric)" />
            <rect x="0" y="0" width="1200" height="40" fill="url(#fabricTexture)" />
            {/* White border along top */}
            <rect x="0" y="0" width="1200" height="3" fill="#ffffff" opacity="0.95" />
          </g>

          {/* Scalloped front flap with natural folds */}
          <g filter="url(#softShadow)">
            {/* Main flap body with curved bottom edge */}
            <path
              d="M 0 40
                 L 1200 40
                 L 1200 150
                 Q 1175 180, 1150 160
                 Q 1125 180, 1100 160
                 Q 1075 180, 1050 160
                 Q 1025 180, 1000 160
                 Q 975 180, 950 160
                 Q 925 180, 900 160
                 Q 875 180, 850 160
                 Q 825 180, 800 160
                 Q 775 180, 750 160
                 Q 725 180, 700 160
                 Q 675 180, 650 160
                 Q 625 180, 600 160
                 Q 575 180, 550 160
                 Q 525 180, 500 160
                 Q 475 180, 450 160
                 Q 425 180, 400 160
                 Q 375 180, 350 160
                 Q 325 180, 300 160
                 Q 275 180, 250 160
                 Q 225 180, 200 160
                 Q 175 180, 150 160
                 Q 125 180, 100 160
                 Q 75 180, 50 160
                 Q 25 180, 0 160
                 Z"
              fill="url(#flapFabric)"
            />
            {/* Fabric texture overlay */}
            <path
              d="M 0 40
                 L 1200 40
                 L 1200 150
                 Q 1175 180, 1150 160
                 Q 1125 180, 1100 160
                 Q 1075 180, 1050 160
                 Q 1025 180, 1000 160
                 Q 975 180, 950 160
                 Q 925 180, 900 160
                 Q 875 180, 850 160
                 Q 825 180, 800 160
                 Q 775 180, 750 160
                 Q 725 180, 700 160
                 Q 675 180, 650 160
                 Q 625 180, 600 160
                 Q 575 180, 550 160
                 Q 525 180, 500 160
                 Q 475 180, 450 160
                 Q 425 180, 400 160
                 Q 375 180, 350 160
                 Q 325 180, 300 160
                 Q 275 180, 250 160
                 Q 225 180, 200 160
                 Q 175 180, 150 160
                 Q 125 180, 100 160
                 Q 75 180, 50 160
                 Q 25 180, 0 160
                 Z"
              fill="url(#fabricTexture)"
            />

            {/* Natural fold lines — vertical seams between scallops */}
            {[50, 150, 250, 350, 450, 550, 650, 750, 850, 950, 1050, 1150].map((x) => (
              <line
                key={x}
                x1={x}
                y1="40"
                x2={x}
                y2="170"
                stroke="rgba(0,0,0,0.12)"
                strokeWidth="1.5"
              />
            ))}

            {/* Subtle highlight along top of flap for depth */}
            <rect x="0" y="40" width="1200" height="2" fill="rgba(255,255,255,0.15)" />

            {/* Clean white border around front flap */}
            <path
              d="M 0 40
                 L 1200 40
                 L 1200 150
                 Q 1175 180, 1150 160
                 Q 1125 180, 1100 160
                 Q 1075 180, 1050 160
                 Q 1025 180, 1000 160
                 Q 975 180, 950 160
                 Q 925 180, 900 160
                 Q 875 180, 850 160
                 Q 825 180, 800 160
                 Q 775 180, 750 160
                 Q 725 180, 700 160
                 Q 675 180, 650 160
                 Q 625 180, 600 160
                 Q 575 180, 550 160
                 Q 525 180, 500 160
                 Q 475 180, 450 160
                 Q 425 180, 400 160
                 Q 375 180, 350 160
                 Q 325 180, 300 160
                 Q 275 180, 250 160
                 Q 225 180, 200 160
                 Q 175 180, 150 160
                 Q 125 180, 100 160
                 Q 75 180, 50 160
                 Q 25 180, 0 160
                 Z"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
            />
          </g>

          {/* Logo + brand name on left side of front flap */}
          <g transform="translate(60, 55)">
            {/* Logo image */}
            <image
              href="/oliva-logo.png"
              x="0"
              y="0"
              width="70"
              height="70"
              preserveAspectRatio="xMidYMid meet"
              opacity="0.97"
            />
            {/* Brand name */}
            <text
              x="82"
              y="48"
              fontFamily="Georgia, 'Times New Roman', serif"
              fontSize="34"
              fontWeight="700"
              fill="#ffffff"
              style={{ letterSpacing: '0.02em' }}
            >
              Oliva
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
