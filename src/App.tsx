import { useState, useEffect, useMemo } from 'react';
import { TelemetryHero } from './components/TelemetryHero';
import { ServiceHeatmap } from './components/ServiceHeatmap';
import { CalibrationModal } from './components/CalibrationModal';
import { ServiceConfig } from './types/telemetry';
import {
  DEFAULT_CONFIGS,
  calculateDaysArray,
  calculateTelemetryStats,
  formatDateReadable,
  parseDate,
} from './utils/telemetryCalculator';
import { tacticalAudio } from './utils/audio';
import { Sliders } from 'lucide-react';

export default function App() {
  // Config default set to 1 April 2026 -> 1 June 2027
  const [config, setConfig] = useState<ServiceConfig>(() => {
    const saved = localStorage.getItem('tactical_telemetry_config_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_CONFIGS[0]; // 1 April 2026 -> 1 June 2027
  });

  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Modal state
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);

  // High precision ticker (updates every second)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save config changes to localStorage
  const handleSaveConfig = (newConfig: ServiceConfig) => {
    setConfig(newConfig);
    localStorage.setItem('tactical_telemetry_config_v3', JSON.stringify(newConfig));
  };

  // Recompute statistics & heatmap matrix dynamically whenever config or time changes
  const telemetryStats = useMemo(() => {
    return calculateTelemetryStats(config, currentTime);
  }, [config, currentTime]);

  const daysArray = useMemo(() => {
    return calculateDaysArray(config, currentTime);
  }, [config, currentTime]);

  const formattedStartDate = useMemo(() => {
    try {
      return formatDateReadable(parseDate(config.startDate)).toUpperCase();
    } catch {
      return config.startDate;
    }
  }, [config.startDate]);

  const formattedEndDate = useMemo(() => {
    try {
      return formatDateReadable(parseDate(config.endDate)).toUpperCase();
    } catch {
      return config.endDate;
    }
  }, [config.endDate]);

  return (
    <div className="min-h-screen bg-base text-fg flex flex-col font-sans selection:bg-accent/30 selection:text-accent-light bg-tactical-grid relative">
      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-10 space-y-6 sm:space-y-8">
        {/* Top Center Title & Controls */}
        <div className="text-center pt-2 pb-1">
          <h1 className="inline-flex items-center justify-center gap-3 text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-[0.12em] select-none">
            <span className="text-white">
              ARMY
            </span>
            <span className="bg-gradient-to-r from-accent-pale via-accent-hover to-accent bg-clip-text text-transparent">
              REDEMPTION
            </span>
          </h1>

          {/* Dynamic Service Dates */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] font-mono-hud text-muted tracking-[0.2em] uppercase">
            <span>SERVICE: {formattedStartDate}</span>
            <span className="text-line-faint">➔</span>
            <span className="text-accent-light">TARGET: {formattedEndDate}</span>
          </div>
        </div>

        {/* Unified Dashboard Card: Hero Telemetry + Service Heatmap */}
        <section id="dashboard" className="bg-surface border border-line relative rounded-lg p-6 lg:p-8">
          <button
            onClick={() => {
              tacticalAudio.playConfirm();
              setIsCalibrationOpen(true);
            }}
            title="Calibrate Service Dates"
            className="absolute top-3 right-3 px-2.5 py-1 text-[11px] font-mono-hud font-semibold text-muted hover:text-white border border-line hover:border-accent rounded transition-colors inline-flex items-center gap-1.5 uppercase cursor-pointer"
          >
            <Sliders className="w-3 h-3" />
            <span>Calibrate</span>
          </button>

          <TelemetryHero stats={telemetryStats} />

          {/* Heatmap integrated below hero */}
          <div className="mt-8 pt-6 border-t border-line">
            <ServiceHeatmap
              days={daysArray}
              stats={telemetryStats}
            />
          </div>
        </section>
      </main>

      {/* Calibration Modal */}
      <CalibrationModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        config={config}
        onSave={handleSaveConfig}
      />
    </div>
  );
}
