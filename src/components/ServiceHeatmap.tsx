
import React, { useMemo, useRef, useEffect } from 'react';
import { TelemetryStats, DayInfo } from '../types/telemetry';

interface ServiceHeatmapProps {
  days: DayInfo[];
  stats: TelemetryStats;
}

export const ServiceHeatmap: React.FC<ServiceHeatmapProps> = ({
  days,
  stats,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement>(null);

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

  const cellDimensionClass = 'w-3 h-3 sm:w-3.5 sm:h-3.5';

  // Month label per week column (shown only when the month changes)
  const monthLabels = useMemo(() => {
    let last = -1;
    return columns.map((week) => {
      const first = week.find(Boolean);
      if (!first) return '';
      const m = first.date.getMonth();
      if (m === last) return '';
      last = m;
      return first.date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    });
  }, [columns]);

  // Center the current week on mount / when the data changes
  useEffect(() => {
    currentRef.current?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [columns]);

  return (
    <div className="relative">
      {/* Heatmap Grid Container */}
      <div ref={scrollRef} className="relative mt-2 overflow-x-auto pb-4 pt-1">
        <div className="inline-block min-w-full flex justify-start md:justify-center">
          {/* Days of week labels + Grid */}
          <div className="flex gap-2" role="group" aria-label={`Service heatmap: ${stats.daysServed} days served, ${stats.daysRemaining} remaining`}>
            {/* Day of week column */}
            <div className="flex flex-col justify-between py-0.5 text-xs font-mono-hud text-muted select-none pr-1 pt-5">
              <span>MON</span>
              <span>WED</span>
              <span>FRI</span>
              <span>SUN</span>
            </div>

            {/* Matrix of Columns (Weeks) */}
            <div className="flex gap-[3px] sm:gap-1">
              {columns.map((week, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-[3px] sm:gap-1">
                  <span className="h-4 w-3 sm:w-3.5 overflow-visible whitespace-nowrap text-xs font-mono-hud text-muted select-none" aria-hidden="true">
                    {monthLabels[colIdx]}
                  </span>
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

                    let cellStyle = 'bg-raised border border-line-soft';
                    if (isServed) {
                      cellStyle = 'bg-ok';
                    } else if (isCurrent) {
                      cellStyle = 'bg-accent-light animate-pulse motion-reduce:animate-none ring-1 ring-accent z-10';
                    }

                    return (
                      <div
                        key={day.dayIndex}
                        ref={isCurrent ? currentRef : undefined}
                        title={`Day ${day.dayIndex} · ${day.dateString} · ${day.status}`}
                        aria-label={`Day ${day.dayIndex} ${day.dateString}`}
                        className={`${cellDimensionClass} rounded-[2px] transition-all duration-150 relative ${cellStyle}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono-hud">
          <div className="flex items-center gap-3 bg-inset px-3 py-1.5 rounded border border-line">
            {/* Served */}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[1px] bg-ok" />
              <span className="text-fg">Served ({stats.daysServed})</span>
            </div>

            {/* Current */}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[1px] bg-accent-light" />
              <span className="text-accent-light">Current (Day {stats.currentDayIndex > 0 ? stats.currentDayIndex : 1})</span>
            </div>

            {/* Remaining */}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[1px] bg-line border border-line-strong" />
              <span className="text-muted">Remaining ({stats.daysRemaining})</span>
            </div>
          </div>
          </div>
    </div>
  );
};
