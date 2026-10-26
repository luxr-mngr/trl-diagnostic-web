import React, { useState } from 'react';

interface ThermometerLevel {
  trl: number;
  color: string;
  /** Vertical centre of the level's arrow and label, in SVG units. */
  y: number;
  description: string;
}

// Ordered top (TRL 9) to bottom (TRL 1). Geometry matches the column segments below.
const LEVELS: ThermometerLevel[] = [
  { trl: 9, color: '#C6161B', y: 83, description: 'Sistema probado con éxito en entorno real.' },
  { trl: 8, color: '#FF1616', y: 120, description: 'Sistema completo y certificado a través de pruebas y demostraciones.' },
  { trl: 7, color: '#FF5757', y: 155.5, description: 'Demostración de sistema o prototipo en un entorno real.' },
  { trl: 6, color: '#FF914D', y: 193, description: 'Modelo de sistema o subsistema o demostración de prototipo en un entorno relevante.' },
  { trl: 5, color: '#FFBD59', y: 229.5, description: 'Validación de componente y/o disposición de los mismos en un entorno relevante.' },
  { trl: 4, color: '#FFDE59', y: 266.5, description: 'Validación de componente y/o disposición de los mismos en entorno de laboratorio.' },
  { trl: 3, color: '#C9E265', y: 298.5, description: 'Función crítica analítica y experimental y/o prueba de concepto característica.' },
  { trl: 2, color: '#7ED957', y: 335.5, description: 'Concepto y/o aplicación tecnológica formulada.' },
  { trl: 1, color: '#008037', y: 392.5, description: 'Principios básicos observados y reportados.' }
];

// Column segments (TRL 9 → TRL 2); TRL 1 is the bulb.
const SEGMENTS = [
  { trl: 9, y: 62, h: 39 },
  { trl: 8, y: 101, h: 35 },
  { trl: 7, y: 136, h: 36 },
  { trl: 6, y: 172, h: 36 },
  { trl: 5, y: 208, h: 39 },
  { trl: 4, y: 247, h: 38 },
  { trl: 3, y: 285, h: 39 },
  { trl: 2, y: 324, h: 40 }
];

const CASING_PATH =
  'M 114.5 70.5 A 29 29 0 0 1 172.5 70.5 L 172.5 332 Q 172.5 347 179.5 350.1 A 56 56 0 1 1 107.5 350.1 Q 114.5 347 114.5 332 Z';

const levelByTrl = (trl: number | null) => LEVELS.find((l) => l.trl === trl) ?? null;

const TrlThermometer: React.FC = () => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);

  // Hover previews a level; click/tap/Enter pins it so it stays after the pointer leaves.
  const active = levelByTrl(hovered ?? pinned);
  const isDimmed = (trl: number) => active !== null && active.trl !== trl;

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-4 md:gap-6 flex-1 min-h-0">
      <div className="flex justify-center sm:w-3/5 min-h-[380px] sm:min-h-[460px]">
        <svg
          viewBox="70 28 260 464"
          className="h-full w-auto max-w-full select-none"
          role="group"
          aria-label="Termómetro con los 9 niveles de madurez tecnológica (TRL)"
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <path id="trl-casing" d={CASING_PATH} />
            <linearGradient id="trl-casing-fill" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#cfcfd1" />
              <stop offset="15%" stopColor="#ececec" />
              <stop offset="55%" stopColor="#e3e3e4" />
              <stop offset="100%" stopColor="#d4d4d6" />
            </linearGradient>
            <filter id="trl-blur" x="-50%" y="-300%" width="200%" height="700%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          {/* Sombra en el suelo */}
          <ellipse cx="143.5" cy="471" rx="58" ry="7" fill="#8a8a8a" opacity="0.7" filter="url(#trl-blur)" />

          {/* Carcasa */}
          <use href="#trl-casing" fill="url(#trl-casing-fill)" stroke="#474747" strokeWidth="2.2" />
          <use
            href="#trl-casing"
            fill="none"
            stroke="#c4c4c6"
            strokeWidth="2"
            transform="translate(143.5 245) scale(0.965 0.985) translate(-143.5 -245)"
          />

          {/* Columna de color y bulbo */}
          {SEGMENTS.map((s) => (
            <rect
              key={s.trl}
              x="130"
              y={s.y}
              width="27"
              height={s.h}
              fill={levelByTrl(s.trl)!.color}
              className="transition-opacity duration-200"
              opacity={isDimmed(s.trl) ? 0.35 : 1}
            />
          ))}
          <circle
            cx="143.5"
            cy="392.5"
            r="40"
            fill="#008037"
            className="transition-opacity duration-200"
            opacity={isDimmed(1) ? 0.35 : 1}
          />

          {/* Flechas, etiquetas y zona interactiva por nivel */}
          {LEVELS.map((level, i) => {
            const isActive = active?.trl === level.trl;
            // Hit area spans halfway to the neighbouring levels so the whole row is clickable.
            const top = i === 0 ? 50 : (LEVELS[i - 1].y + level.y) / 2;
            const bottom = i === LEVELS.length - 1 ? 440 : (level.y + LEVELS[i + 1].y) / 2;
            const lineStart = level.trl === 1 ? 182 : 157;
            return (
              <g
                key={level.trl}
                role="button"
                tabIndex={0}
                aria-label={`TRL ${level.trl}: ${level.description}`}
                aria-pressed={pinned === level.trl}
                className="cursor-pointer outline-none transition-opacity duration-200"
                opacity={isDimmed(level.trl) ? 0.35 : 1}
                onMouseEnter={() => setHovered(level.trl)}
                onFocus={() => setHovered(level.trl)}
                onBlur={() => setHovered(null)}
                onClick={() => setPinned((p) => (p === level.trl ? null : level.trl))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPinned((p) => (p === level.trl ? null : level.trl));
                  }
                }}
              >
                <rect x="100" y={top} width="230" height={bottom - top} fill="transparent" />
                <line x1={lineStart} y1={level.y} x2="215" y2={level.y} stroke={level.color} strokeWidth="4" />
                <polygon
                  points={`213,${level.y - 7} 213,${level.y + 7} 225,${level.y}`}
                  fill={level.color}
                />
                <text
                  x="233"
                  y={level.y + 9.5}
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  fontWeight="800"
                  fontSize={isActive ? 28 : 26}
                  fill={isActive ? '#003B91' : '#000000'}
                >
                  TRL {level.trl}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Descripción del nivel activo */}
      <div className="sm:w-2/5 flex items-center" aria-live="polite">
        {active ? (
          <div
            className="w-full bg-white rounded-[20px] p-4 md:p-5 shadow-sm border-l-8 animate-fadeIn"
            style={{ borderLeftColor: active.color }}
          >
            <p className="text-2xl md:text-3xl font-black text-[#002B5B] mb-2">TRL {active.trl}</p>
            <p className="text-sm md:text-base text-black leading-relaxed">{active.description}</p>
          </div>
        ) : (
          <p className="w-full text-center sm:text-left text-sm md:text-base text-black/70 leading-relaxed px-2">
            Pasa el mouse o toca un nivel del termómetro para ver qué significa.
          </p>
        )}
      </div>
    </div>
  );
};

export default TrlThermometer;
