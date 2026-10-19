import React, { useState, useMemo } from 'react';
import { TelemetryStats, DayInfo, ServiceConfig } from '../types/telemetry';
import { tacticalAudio } from '../utils/audio';
import { LayoutGrid, ZoomIn, ZoomOut, Info, ShieldCheck, Flag, Sparkles } from 'lucide-react';

interface ServiceHeatmapProps {
  days: DayInfo[];
  stats: TelemetryStats;
  config: ServiceConfig;
  onSelectDay?: (day: DayInfo) => void;
}

export const ServiceHeatmap: React.FC<ServiceHeatmapProps> = ({
  days,
  stats,
  config,
  onSelectDay,
}) => {
  const [hoveredDay, setHoveredDay] = useState<DayInfo | null>(null);
  const [cellSize, setCellSize] = useState<'normal' | 'compact'>('normal');

  // Group days into columns of 7 (weeks)
  const columns = useMemo(() => {
    const cols: DayInfo[][] = [];
    let currentCol: DayInfo[] = [];

    // Pad beginning so the first day aligns with its day of week (0=Sun, 1=Mon, etc.)
    if (days.length > 0) {
      const firstDayOfWeek = days[0].date.getDay(); // 0 is Sunday
      // Let's use Monday as row 0 (or standard 7-day grid)
      // Standardize: row 0 = Monday, row 6 = Sunday
      const mondayOffset = (firstDayOfWeek + 6) % 7;
      for (let i = 0; i < mondayOffset; i++) {
        // empty placeholder
        currentCol.push(null as unknown as DayInfo);
      }
    }

    days.forEach((day) => {
      currentCol.push(day);
      if (currentCol.length === 7) {
        cols.push(currentCol);
        currentCol = [];
      }
    });

    if (currentCol.length > 0) {
      while (currentCol.length < 7) {
        currentCol.push(null as unknown as DayInfo);
      }
      cols.push(currentCol);
    }

    return cols;
  }, [days]);

  const cellDimensionClass = cellSize === 'normal' 
    ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' 
    : 'w-2 h-2 sm:w-2.5 sm:h-2.5';

  return (
    <div className="bg-[#12181f]/90 border border-[#1e2630] rounded-lg p-5 lg:p-7 backdrop-blur-md relative shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1e2630]/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-[#4edea3]" />
            <h3 className="text-base sm:text-lg font-space font-bold tracking-wider text-white uppercase flex items-center gap-2">
              <span>{stats.totalDays}-DAY SERVICE INTEGRITY HEATMAP</span>
            </h3>
          </div>
          <p className="text-[11px] font-mono-hud text-[#94a3b8] tracking-[0.16em] uppercase">
            INDIVIDUAL DAY-BY-DAY AUDIT TRAIL
          </p>
        </div>

        {/* Legend & Controls */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono-hud">
          <div className="flex items-center gap-3 bg-[#0e141b] px-3 py-1.5 rounded border border-[#1e2630]">
            {/* Served */}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[1px] bg-[#4edea3] shadow-[0_0_6px_rgba(78,222,163,0.4)]" />
              <span className="text-[#dde3ed]">Served ({stats.daysServed})</span>
            </div>

            {/* Current */}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[1px] bg-[#ffc174] shadow-[0_0_8px_rgba(255,193,116,0.6)] animate-pulse" />
              <span className="text-[#ffc174]">Current (Day {stats.currentDayIndex > 0 ? stats.currentDayIndex : 1})</span>
            </div>

            {/* Remaining */}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[1px] bg-[#1e2630] border border-[#2a3441]" />
              <span className="text-[#94a3b8]">Remaining ({stats.daysRemaining})</span>
            </div>
          </div>

          {/* Density toggle */}
          <div className="flex items-center gap-1 bg-[#0e141b] p-0.5 rounded border border-[#1e2630]">
            <button
              onClick={() => {
                setCellSize('normal');
                tacticalAudio.playHover();
              }}
              title="Standard Grid"
              className={`p-1 rounded transition-colors ${cellSize === 'normal' ? 'bg-[#242a32] text-white' : 'text-[#94a3b8] hover:text-white'}`}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setCellSize('compact');
                tacticalAudio.playHover();
              }}
              title="Compact View"
              className={`p-1 rounded transition-colors ${cellSize === 'compact' ? 'bg-[#242a32] text-white' : 'text-[#94a3b8] hover:text-white'}`}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hover Info Banner */}
      <div className="my-3 min-h-[30px] flex items-center justify-between px-3 py-1.5 rounded bg-[#0e141b]/80 border border-[#1e2630] text-xs font-mono-hud text-[#dde3ed]">
        {hoveredDay ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[#54ddfc] font-bold">DAY {hoveredDay.dayIndex}</span>
            <span className="text-[#343a41]">|</span>
            <span className="text-white font-medium">{hoveredDay.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
            <span className="text-[#343a41]">|</span>
            <span className={`uppercase font-semibold ${
              hoveredDay.status === 'served' ? 'text-[#4edea3]' :
              hoveredDay.status === 'current' ? 'text-[#ffc174]' : 'text-[#94a3b8]'
            }`}>
              {hoveredDay.status === 'served' ? 'STATUS: SERVED & SECURED' :
               hoveredDay.status === 'current' ? 'STATUS: ACTIVE DUTY TODAY' :
               hoveredDay.isTerminalLeave ? 'STATUS: TERMINAL LEAVE' : 'STATUS: SCHEDULED'}
            </span>
            {hoveredDay.milestoneTitle && (
              <>
                <span className="text-[#343a41]">|</span>
                <span className="text-[#ffc174] flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3 h-3 text-[#f59e0b]" />
                  {hoveredDay.milestoneTitle}
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="text-[#94a3b8] flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-[#54ddfc]" />
            <span>Hover over or click any individual day block to inspect operational status and milestone data.</span>
          </div>
        )}

        <div className="text-[11px] text-[#94a3b8] hidden sm:block">
          CALIBRATED: {config.startDate} TO {config.endDate}
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="relative mt-2 overflow-x-auto pb-4 pt-1">
        <div className="inline-block min-w-full">
          {/* Days of week labels + Grid */}
          <div className="flex gap-2">
            {/* Day of week column */}
            <div className="flex flex-col justify-between py-0.5 text-[9px] font-mono-hud text-[#94a3b8]/60 select-none pr-1">
              <span>MON</span>
              <span>WED</span>
              <span>FRI</span>
              <span>SUN</span>
            </div>

            {/* Matrix of Columns (Weeks) */}
            <div className="flex gap-[3px] sm:gap-1">
              {columns.map((week, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-[3px] sm:gap-1">
                  {week.map((day, rowIdx) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${colIdx}-${rowIdx}`}
                          className={`${cellDimensionClass} opacity-0 pointer-events-none`}
                        />
                      );
                    }

                    const isServed = day.status === 'served';
                    const isCurrent = day.status === 'current';
                    const isRemaining = day.status === 'remaining';

                    let cellStyle = 'bg-[#1a2027] border border-[#242a32]';
                    if (isServed) {
                      cellStyle = 'bg-[#4edea3] hover:bg-[#6ffbbe] shadow-[0_0_3px_rgba(78,222,163,0.3)]';
                    } else if (isCurrent) {
                      cellStyle = 'bg-[#ffc174] ring-2 ring-[#f59e0b] shadow-[0_0_12px_rgba(245,158,11,0.8)] z-10 scale-110';
                    } else if (day.isTerminalLeave) {
                      cellStyle = 'bg-[#1a2027] border border-[#f59e0b]/40 hover:border-[#f59e0b]';
                    }

                    return (
                      <button
                        key={day.dayIndex}
                        onClick={() => {
                          tacticalAudio.playConfirm();
                          if (onSelectDay) onSelectDay(day);
                        }}
                        onMouseEnter={() => {
                          tacticalAudio.playHover();
                          setHoveredDay(day);
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                        aria-label={`Day ${day.dayIndex} ${day.dateString}`}
                        className={`${cellDimensionClass} rounded-[2px] transition-all duration-150 cursor-pointer relative group ${cellStyle}`}
                      >
                        {/* Milestone indicator dot on remaining / served days */}
                        {day.isMilestone && !isCurrent && (
                          <span className={`absolute inset-0 m-auto w-1 h-1 rounded-full ${isServed ? 'bg-[#0b0f12]' : 'bg-[#ffc174]'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
