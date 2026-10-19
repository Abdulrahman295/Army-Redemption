export interface ServiceConfig {
  id: string;
  presetName: string;
  title: string;
  callsign: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  targetDescription: string;
  terminalLeaveDays: number; // days before end date
}

export interface DayInfo {
  date: Date;
  dateString: string;
  dayIndex: number; // 1-based index (e.g. 1 to 367)
  status: 'served' | 'current' | 'remaining';
  isMilestone?: boolean;
  milestoneTitle?: string;
  isTerminalLeave?: boolean;
}

export interface TelemetryStats {
  totalDays: number;
  daysServed: number;
  daysRemaining: number;
  currentDayIndex: number;
  percentComplete: number;
  weeksRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  isCompleted: boolean;
  isStarted: boolean;
  targetTerminalLeaveDate: string;
  milestones: {
    day: number;
    title: string;
    percent: number;
    dateString: string;
    reached: boolean;
  }[];
}
