import { useState } from "react";
import { MAP_PINS } from "@/data/profile";

export default function ExperienceMap() {
  const [hovered, setHovered] = useState<string | null>(null);

  const W = 800;
  const H = 480;
  const toXY = (pin: (typeof MAP_PINS)[number]) => ({
    x: (pin.cx / 100) * W,
    y: (pin.cy / 100) * H,
  });
  const hub = toXY(MAP_PINS[0]);

  return (
    <div className="w-full overflow-hidden rounded-sm" style={{ background: "hsl(var(--navy-deep))", border: "1px solid hsl(var(--navy-soft) / 0.15)" }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
        <defs>
          <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--navy-soft))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--navy-soft))" stopOpacity="0" />
          </radialGradient>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--navy-soft) / 0.06)" strokeWidth="0.5" />
          </pattern>
        </defs>

        <rect width={W} height={H} fill="url(#grid)" />

        {/* Stylised continent silhouettes — abstract, not geographic precision */}
        <g fill="hsl(var(--navy) / 0.22)" stroke="hsl(var(--navy-soft) / 0.18)" strokeWidth="0.6">
          {/* British Isles */}
          <ellipse cx="170" cy="80" rx="22" ry="32" />
          {/* Scandinavia */}
          <path d="M 230 50 Q 260 30 280 90 L 250 130 Q 220 110 230 50 Z" />
          {/* Western Europe */}
          <path d="M 200 130 Q 240 120 270 160 L 260 220 Q 200 230 180 180 Z" />
          {/* Italy/Balkans */}
          <path d="M 270 200 L 310 220 L 305 270 L 270 250 Z" />
          {/* Turkey/Levant */}
          <path d="M 310 220 Q 360 215 400 240 L 395 280 Q 340 285 305 270 Z" />
          {/* Arabian Peninsula */}
          <path d="M 470 290 Q 540 280 600 340 Q 620 410 560 430 Q 500 420 470 380 Z" />
          {/* North Africa */}
          <path d="M 200 280 Q 320 270 420 290 L 430 360 Q 320 370 200 350 Z" />
          {/* Sub-Saharan Africa */}
          <path d="M 320 360 Q 420 360 460 430 L 420 470 Q 340 460 320 410 Z" />
          {/* Iran */}
          <path d="M 600 260 Q 650 250 690 290 L 670 330 Q 620 320 595 290 Z" />
        </g>

        {/* Hub glow */}
        <circle cx={hub.x} cy={hub.y} r="70" fill="url(#hubGlow)" />

        {/* Connection arcs */}
        {MAP_PINS.filter((p) => !p.primary).map((pin) => {
          const { x, y } = toXY(pin);
          const mx = (hub.x + x) / 2;
          const my = Math.min(hub.y, y) - 50;
          return (
            <path
              key={pin.city}
              d={`M ${hub.x} ${hub.y} Q ${mx} ${my} ${x} ${y}`}
              fill="none"
              stroke="hsl(var(--navy-soft))"
              strokeWidth="1"
              strokeOpacity={hovered === pin.city ? 0.9 : 0.3}
              strokeDasharray="3 4"
              className="transition-all duration-300"
            />
          );
        })}

        {/* Pins */}
        {MAP_PINS.map((pin) => {
          const { x, y } = toXY(pin);
          const isH = hovered === pin.city;
          const labelLeft = x < W / 2;
          return (
            <g
              key={pin.city}
              onMouseEnter={() => setHovered(pin.city)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              {pin.primary && (
                <>
                  <circle cx={x} cy={y} r="14" fill="hsl(var(--navy-soft))" fillOpacity="0.2">
                    <animate attributeName="r" from="10" to="22" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="fill-opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={x} cy={y} r="8" fill="hsl(var(--navy-soft))" />
                </>
              )}
              {!pin.primary && <circle cx={x} cy={y} r={isH ? 7 : 5} fill="hsl(var(--cream))" className="transition-all duration-200" />}

              {isH && (
                <g>
                  <rect
                    x={labelLeft ? x + 14 : x - 144}
                    y={y - 28}
                    width="130"
                    height="46"
                    fill="hsl(var(--ink))"
                    stroke="hsl(var(--navy-soft) / 0.4)"
                    rx="2"
                  />
                  <text
                    x={labelLeft ? x + 22 : x - 136}
                    y={y - 11}
                    fill="hsl(var(--cream))"
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="DM Sans, sans-serif"
                  >
                    {pin.city}, {pin.country}
                  </text>
                  <text
                    x={labelLeft ? x + 22 : x - 136}
                    y={y + 6}
                    fill="hsl(var(--navy-soft))"
                    fontSize="9"
                    fontFamily="DM Sans, sans-serif"
                  >
                    {pin.years}
                  </text>
                </g>
              )}
              {!isH && (
                <text
                  x={x}
                  y={y + 22}
                  textAnchor="middle"
                  fill="hsl(var(--cream) / 0.6)"
                  fontSize="10"
                  fontFamily="DM Sans, sans-serif"
                  fontWeight="500"
                >
                  {pin.city}
                </text>
              )}
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(24, 444)">
          <circle cx="6" cy="0" r="5" fill="hsl(var(--navy-soft))" />
          <text x="18" y="4" fill="hsl(var(--cream) / 0.6)" fontSize="10" fontFamily="DM Sans, sans-serif">
            Current base
          </text>
          <circle cx="116" cy="0" r="4" fill="hsl(var(--cream))" />
          <text x="128" y="4" fill="hsl(var(--cream) / 0.6)" fontSize="10" fontFamily="DM Sans, sans-serif">
            Previous / project
          </text>
        </g>
      </svg>
    </div>
  );
}
