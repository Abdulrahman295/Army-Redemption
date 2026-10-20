import React from 'react';
import { TelemetryStats } from '../types/telemetry';
import { tacticalAudio } from '../utils/audio';

interface TelemetryHeroProps {
  stats: TelemetryStats;
}

export const TelemetryHero: React.FC<TelemetryHeroProps> = ({ stats }) => {
  // SVG circular gauge geometry
  const size = 260;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth - 14;
  const circumference = 2 * Math.PI * radius;

  // Arc stroke dashoffset based on percentComplete (0 to 100)
  const clampedPercent = Math.min(100, Math.max(0, stats.percentComplete));
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

  return (
    <div className="relative overflow-hidden">
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Circular HUD Gauge */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div 
            className="relative flex items-center justify-center cursor-default w-[210px] h-[210px] sm:w-[240px] sm:h-[240px] lg:w-[260px] lg:h-[260px]"
            onMouseEnter={() => tacticalAudio.playHover()}
          >

            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full transform -rotate-90"
            >
              <defs>
                <linearGradient id="tacticalGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#54ddfc" />
                  <stop offset="45%" stopColor="#4edea3" />
                  <stop offset="85%" stopColor="#ffc174" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>

              {/* Ticks ring */}
              <circle
                cx={center}
                cy={center}
                r={radius + 8}
                fill="none"
                stroke="#1e2630"
                strokeWidth="1.5"
                strokeDasharray="2 6"
              />

              {/* Background circular track */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#161c23"
                strokeWidth={strokeWidth}
              />

              {/* Active illuminated progress arc */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="url(#tacticalGaugeGradient)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none px-2">
              <span className="text-xs font-mono-hud text-muted tracking-[0.2em] font-medium uppercase mb-0.5 sm:mb-1">
                REDEMPTION
              </span>
              <span className="text-3xl sm:text-4xl lg:text-[46px] font-mono-hud font-bold text-white tracking-tight leading-none">
                {clampedPercent.toFixed(1)}<span className="text-xl sm:text-2xl text-accent-light font-semibold">%</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Days Until Freedom & Telemetry Breakdowns */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-hud tracking-[0.16em] text-sand font-semibold uppercase">
                DAYS UNTIL FREEDOM
              </span>
              <span className="text-xs font-mono-hud text-ok bg-inset px-2 py-0.5 rounded border border-line">
                {stats.isCompleted ? 'ZERO DELTA' : 'ACTIVE'}
              </span>
            </div>

            {/* Main Hero Number */}
            <div className="flex items-baseline gap-3 pt-1">
              <span aria-label={`${stats.daysRemaining} days left`} className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white tracking-tight font-mono-hud">
                {stats.daysRemaining.toLocaleString()}
              </span>
              <span className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-accent-light tracking-wide uppercase">
                DAYS LEFT
              </span>
            </div>
          </div>

          {/* Telemetry Breakdown Strip */}
          <div className="mt-6 pt-6 border-t border-line grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-xs font-mono-hud text-muted tracking-wider uppercase font-semibold">
                WEEKS
              </div>
              <div className="text-xl lg:text-2xl font-mono-hud font-bold text-info">
                {stats.weeksRemaining.toFixed(1)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-mono-hud text-muted tracking-wider uppercase font-semibold">
                HOURS
              </div>
              <div className="text-xl lg:text-2xl font-mono-hud font-bold text-white">
                {stats.hoursRemaining.toLocaleString()}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-mono-hud text-muted tracking-wider uppercase font-semibold">
                MINUTES
              </div>
              <div className="text-xl lg:text-2xl font-mono-hud font-bold text-ok">
                {stats.minutesRemaining.toLocaleString()}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-mono-hud text-muted tracking-wider uppercase font-semibold">
                SECONDS
              </div>
              <div className="text-xl lg:text-2xl font-mono-hud font-bold text-accent-light tabular-nums">
                {(stats.secondsRemaining % 60).toString().padStart(2, '0')}s
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
