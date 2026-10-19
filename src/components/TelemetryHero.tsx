import React from 'react';
import { TelemetryStats, ServiceConfig } from '../types/telemetry';
import { tacticalAudio } from '../utils/audio';

interface TelemetryHeroProps {
  stats: TelemetryStats;
  config: ServiceConfig;
  currentTime: Date;
}

export const TelemetryHero: React.FC<TelemetryHeroProps> = ({ stats, config }) => {
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
    <div className="bg-[#12181f]/90 border border-[#1e2630] rounded-lg p-6 lg:p-8 backdrop-blur-md relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left: Circular HUD Gauge */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <div 
            className="relative flex items-center justify-center cursor-default group"
            onMouseEnter={() => tacticalAudio.playHover()}
          >
            {/* Outer subtle glow ring */}
            <div 
              className="absolute inset-0 rounded-full blur-xl opacity-20 transition-opacity duration-500 group-hover:opacity-40"
              style={{
                background: 'radial-gradient(circle, rgba(78,222,163,0.3) 0%, rgba(245,158,11,0.2) 60%, transparent 80%)'
              }}
            />

            <svg
              width={size}
              height={size}
              className="transform -rotate-90 drop-shadow-[0_0_12px_rgba(78,222,163,0.2)]"
            >
              <defs>
                <linearGradient id="tacticalGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#54ddfc" />
                  <stop offset="45%" stopColor="#4edea3" />
                  <stop offset="85%" stopColor="#ffc174" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>

                <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
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
                filter="url(#gaugeGlow)"
                className="transition-all duration-1000 ease-out"
              />

              {/* Inner secondary hairline */}
              <circle
                cx={center}
                cy={center}
                r={radius - 12}
                fill="none"
                stroke="#242a32"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.6"
              />
            </svg>

            {/* Inner Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
              <span className="text-[11px] font-mono-hud text-[#94a3b8] tracking-[0.2em] font-medium uppercase mb-1">
                REDEMPTION
              </span>
              <span className="text-4xl lg:text-[46px] font-mono-hud font-bold text-white tracking-tight leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {clampedPercent.toFixed(1)}<span className="text-2xl text-[#ffc174] font-semibold">%</span>
              </span>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono-hud text-[#54ddfc] tracking-widest uppercase">
                <span className={`w-1.5 h-1.5 rounded-full ${stats.isCompleted ? 'bg-[#4edea3]' : 'bg-[#f59e0b] animate-ping'}`} />
                <span>{stats.isCompleted ? 'DUTY ACCOMPLISHED' : 'T-MINUS RUNNING'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Days Until Freedom & Telemetry Breakdowns */}
        <div className="md:col-span-7 flex flex-col justify-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-hud tracking-[0.16em] text-[#d8c3ad] font-semibold uppercase">
                DAYS UNTIL FREEDOM
              </span>
              <span className="text-[10px] font-mono-hud text-[#4edea3] bg-[#0e141b] px-2 py-0.5 rounded border border-[#1e2630]">
                {stats.isCompleted ? 'ZERO DELTA' : 'ACTIVE'}
              </span>
            </div>

            {/* Main Hero Number */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-5xl lg:text-6xl font-space font-bold text-white tracking-tight font-mono-hud">
                {stats.daysRemaining.toLocaleString()}
              </span>
              <span className="text-2xl lg:text-3xl font-cinzel font-bold text-[#ffc174] tracking-wide uppercase">
                DAYS LEFT
              </span>
            </div>
          </div>

          {/* Telemetry Breakdown Strip */}
          <div className="mt-6 pt-6 border-t border-[#1e2630] grid grid-cols-3 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-[11px] font-mono-hud text-[#94a3b8] tracking-wider uppercase font-semibold">
                WEEKS
              </div>
              <div className="text-xl lg:text-2xl font-mono-hud font-bold text-[#54ddfc]">
                {stats.weeksRemaining.toFixed(1)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-mono-hud text-[#94a3b8] tracking-wider uppercase font-semibold">
                HOURS
              </div>
              <div className="text-xl lg:text-2xl font-mono-hud font-bold text-white">
                {stats.hoursRemaining.toLocaleString()}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-mono-hud text-[#94a3b8] tracking-wider uppercase font-semibold">
                MINUTES
              </div>
              <div className="text-xl lg:text-2xl font-mono-hud font-bold text-[#4edea3]">
                {stats.minutesRemaining.toLocaleString()}
              </div>
            </div>

            <div className="space-y-1 hidden sm:block">
              <div className="text-[11px] font-mono-hud text-[#94a3b8] tracking-wider uppercase font-semibold">
                SECONDS
              </div>
              <div className="text-xl lg:text-2xl font-mono-hud font-bold text-[#ffc174] tabular-nums">
                {(stats.secondsRemaining % 60).toString().padStart(2, '0')}s
              </div>
            </div>
          </div>

          {/* Secondary Telemetry Strip: Terminal leave & Passed ratio */}
          <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-hud text-[#94a3b8] bg-[#0e141b]/70 px-3 py-2 rounded border border-[#1e2630]/60">
            <div className="flex items-center gap-2">
              <span className="text-[#a08e7a]">SERVED:</span>
              <span className="text-[#4edea3] font-semibold">{stats.daysServed} days</span>
              <span className="text-[#343a41]">/</span>
              <span className="text-[#dde3ed]">{stats.totalDays} total</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#a08e7a]">TERMINAL LEAVE TARGET:</span>
              <span className="text-[#ffc174] font-semibold">{stats.targetTerminalLeaveDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
