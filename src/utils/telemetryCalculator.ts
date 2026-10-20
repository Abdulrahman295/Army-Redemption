import { ServiceConfig, TelemetryStats, DayInfo } from '../types/telemetry';

export const DEFAULT_CONFIGS: ServiceConfig[] = [
  {
    id: 'real-primary-dmy',
    presetName: '1 April 2026 → 1 June 2027 (Active)',
    title: 'ARMY REDEMPTION',
    callsign: 'RECRUIT // OPERATIONAL CORPS',
    startDate: '2026-04-01',
    endDate: '2027-06-01',
    targetDescription: 'Targeting Final Outprocessing & Terminal Leave',
    terminalLeaveDays: 14,
  },
  {
    id: 'real-mdy',
    presetName: 'Jan 4, 2026 → Jan 6, 2027 (M/D/Y Alternative)',
    title: 'ARMY REDEMPTION',
    callsign: 'RECRUIT // OPERATIONAL CORPS',
    startDate: '2026-01-04',
    endDate: '2027-01-06',
    targetDescription: 'Targeting Final Outprocessing & Terminal Leave',
    terminalLeaveDays: 14,
  },
  {
    id: 'screenshot-demo',
    presetName: '730-Day Tour (Screenshot Reference)',
    title: 'ARMY REDEMPTION',
    callsign: 'NCO // AIR DEFENSE BDE',
    startDate: '2023-10-01',
    endDate: '2025-10-01',
    targetDescription: 'Targeting Final Outprocessing & Terminal Leave',
    terminalLeaveDays: 30,
  },
];

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

export function formatDateReadable(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function calculateDaysArray(config: ServiceConfig, now: Date): DayInfo[] {
  const start = parseDate(config.startDate);
  const end = parseDate(config.endDate);

  const todayString = formatLocalDateString(now);

  const days: DayInfo[] = [];
  const current = new Date(start);
  let index = 1;

  // Find total days count to calculate terminal leave cutoff
  const totalDaysEstimate = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const terminalLeaveStartIndex = Math.max(1, totalDaysEstimate - config.terminalLeaveDays);

  while (current <= end) {
    const dateString = formatLocalDateString(current);
    let status: 'served' | 'current' | 'remaining' = 'remaining';

    if (dateString < todayString) {
      status = 'served';
    } else if (dateString === todayString) {
      status = 'current';
    } else {
      status = 'remaining';
    }

    const isTerminalLeave = index >= terminalLeaveStartIndex;
    let milestoneTitle: string | undefined;

    if (index === 1) {
      milestoneTitle = 'Service Day 1 [START]';
    } else if (index === Math.round(totalDaysEstimate * 0.25)) {
      milestoneTitle = '25% Mark Cleared';
    } else if (index === Math.round(totalDaysEstimate * 0.5)) {
      milestoneTitle = '50% Midpoint [Downhill]';
    } else if (index === Math.round(totalDaysEstimate * 0.75)) {
      milestoneTitle = '75% Home Stretch';
    } else if (index === terminalLeaveStartIndex && config.terminalLeaveDays > 0) {
      milestoneTitle = 'Terminal Leave Starts';
    } else if (dateString === config.endDate) {
      milestoneTitle = 'Redemption / Discharge Day';
    }

    days.push({
      date: new Date(current),
      dateString: formatLocalDateString(current),
      dayIndex: index,
      status,
      isMilestone: Boolean(milestoneTitle),
      milestoneTitle,
      isTerminalLeave,
    });

    current.setDate(current.getDate() + 1);
    index++;
  }

  return days;
}

export function calculateTelemetryStats(config: ServiceConfig, now: Date): TelemetryStats {
  const start = parseDate(config.startDate);
  // End date targeting 23:59:59 of that day
  const end = parseDate(config.endDate);
  end.setHours(23, 59, 59, 999);

  const totalMs = end.getTime() - start.getTime();
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const nowMs = now.getTime();

  const isCompleted = nowMs >= end.getTime();
  const isStarted = nowMs >= start.getTime();

  let daysServed = 0;
  let currentDayIndex = 1;

  if (!isStarted) {
    daysServed = 0;
    currentDayIndex = 0;
  } else if (isCompleted) {
    daysServed = totalDays;
    currentDayIndex = totalDays;
  } else {
    // Number of full calendar days elapsed before today
    const servedDiffMs = Math.max(0, today.getTime() - start.getTime());
    daysServed = Math.round(servedDiffMs / (1000 * 60 * 60 * 24));
    currentDayIndex = daysServed + 1;
  }

  const daysRemaining = Math.max(0, totalDays - daysServed - (isCompleted ? 0 : 1));

  // High precision percentage based on milliseconds
  let percentComplete = 0;
  if (isCompleted) {
    percentComplete = 100;
  } else if (isStarted) {
    const elapsedMs = Math.max(0, nowMs - start.getTime());
    percentComplete = Math.min(99.9, Math.max(0, (elapsedMs / totalMs) * 100));
  }

  // Exact countdown time remaining
  const msRemaining = Math.max(0, end.getTime() - nowMs);
  const secondsRemaining = Math.floor(msRemaining / 1000);
  const minutesRemaining = Math.floor(msRemaining / (1000 * 60));
  const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
  const weeksRemaining = +(msRemaining / (1000 * 60 * 60 * 24 * 7)).toFixed(1);

  // Terminal leave date calculation
  const terminalDate = new Date(end);
  terminalDate.setDate(terminalDate.getDate() - config.terminalLeaveDays);
  const targetTerminalLeaveDate = formatDateReadable(terminalDate);

  // Milestones array
  const q25Day = Math.round(totalDays * 0.25);
  const q50Day = Math.round(totalDays * 0.5);
  const q75Day = Math.round(totalDays * 0.75);

  const getDateForDay = (dIdx: number) => {
    const d = new Date(start);
    d.setDate(d.getDate() + (dIdx - 1));
    return formatDateReadable(d);
  };

  const milestones = [
    {
      day: 1,
      title: 'Induction & Day Zero',
      percent: 0,
      dateString: formatDateReadable(start),
      reached: daysServed >= 1,
    },
    {
      day: q25Day,
      title: 'First Quarter (25%)',
      percent: 25,
      dateString: getDateForDay(q25Day),
      reached: daysServed >= q25Day,
    },
    {
      day: q50Day,
      title: 'The Golden Midpoint (50%)',
      percent: 50,
      dateString: getDateForDay(q50Day),
      reached: daysServed >= q50Day,
    },
    {
      day: q75Day,
      title: 'Home Stretch (75%)',
      percent: 75,
      dateString: getDateForDay(q75Day),
      reached: daysServed >= q75Day,
    },
    {
      day: Math.max(1, totalDays - config.terminalLeaveDays),
      title: 'Terminal Leave Outprocessing',
      percent: Math.round(((totalDays - config.terminalLeaveDays) / totalDays) * 100),
      dateString: targetTerminalLeaveDate,
      reached: daysServed >= (totalDays - config.terminalLeaveDays),
    },
    {
      day: totalDays,
      title: 'Redemption Day (Freedom)',
      percent: 100,
      dateString: formatDateReadable(end),
      reached: isCompleted,
    },
  ];

  return {
    totalDays,
    daysServed,
    daysRemaining,
    currentDayIndex,
    percentComplete,
    weeksRemaining,
    hoursRemaining,
    minutesRemaining,
    secondsRemaining,
    isCompleted,
    isStarted,
    targetTerminalLeaveDate,
    milestones,
  };
}
