import React, { useState, useEffect, useMemo } from 'react';
import { TelemetryHero } from './components/TelemetryHero';
import { ServiceHeatmap } from './components/ServiceHeatmap';
import { CalibrationModal } from './components/CalibrationModal';
import { DayDetailModal } from './components/DayDetailModal';
import { ExportSummaryModal } from './components/ExportSummaryModal';
import { ServiceConfig, DayInfo } from './types/telemetry';
import {
  DEFAULT_CONFIGS,
  calculateDaysArray,
  calculateTelemetryStats,
} from './utils/telemetryCalculator';
import { tacticalAudio } from './utils/audio';
import { Volume2, VolumeX, Sliders, Download } from 'lucide-react';

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
  const [isMuted, setIsMuted] = useState(tacticalAudio.getMuted());

  // Modals state
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null);

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

  const handleToggleSound = () => {
    const muted = tacticalAudio.toggleMute();
    setIsMuted(muted);
  };

  // Recompute statistics & heatmap matrix dynamically whenever config or time changes
  const telemetryStats = useMemo(() => {
    return calculateTelemetryStats(config, currentTime);
  }, [config, currentTime]);

  const daysArray = useMemo(() => {
    return calculateDaysArray(config, currentTime);
  }, [config, currentTime]);

  return (
    <div className="min-h-screen bg-[#0b0f12] text-[#dde3ed] flex flex-col font-sans selection:bg-[#f59e0b]/30 selection:text-[#ffc174] bg-tactical-grid relative">
      {/* Discreet corner utility buttons (No navbar) */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={handleToggleSound}
          title={isMuted ? 'Enable Sound' : 'Mute Sound'}
          className="p-2 rounded bg-[#12181f]/90 border border-[#1e2630] text-[#94a3b8] hover:text-white backdrop-blur transition-colors"
          aria-label="Toggle Sound"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-[#94a3b8]" /> : <Volume2 className="w-4 h-4 text-[#ffb95f]" />}
        </button>

        <button
          onClick={() => {
            tacticalAudio.playConfirm();
            setIsExportOpen(true);
          }}
          title="Export Dossier"
          className="p-2 rounded bg-[#12181f]/90 border border-[#1e2630] text-[#94a3b8] hover:text-white backdrop-blur transition-colors hidden sm:block"
          aria-label="Export Dossier"
        >
          <Download className="w-4 h-4 text-[#4edea3]" />
        </button>

        <button
          onClick={() => {
            tacticalAudio.playConfirm();
            setIsCalibrationOpen(true);
          }}
          title="Calibrate Service Dates"
          className="px-3 py-1.5 text-xs font-mono-hud font-semibold text-[#0b0f12] bg-[#f59e0b] hover:bg-[#ffb95f] rounded backdrop-blur transition-all flex items-center gap-1.5 uppercase shadow-[0_0_12px_rgba(245,158,11,0.3)]"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Calibrate</span>
        </button>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 space-y-8">
        {/* Top Center Title (No navbar) */}
        <div className="text-center pt-2 pb-1">
          <h1 className="inline-flex items-center justify-center gap-3 text-3xl sm:text-4xl md:text-5xl font-cinzel font-black tracking-wider select-none">
            <span className="text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]">
              ARMY
            </span>
            <span className="bg-gradient-to-r from-[#ffddb8] via-[#ffb95f] to-[#f59e0b] bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(245,158,11,0.4)]">
              REDEMPTION
            </span>
          </h1>
          <div className="mt-2 text-[11px] font-mono-hud text-[#94a3b8] tracking-[0.2em] uppercase">
            <span>SERVICE: 1 APRIL 2026</span>
            <span className="text-[#343a41] mx-2">➔</span>
            <span className="text-[#ffc174]">TARGET: 1 JUNE 2027</span>
          </div>
        </div>

        {/* Section 1: Hero Telemetry Card (Circular Gauge + Countdown Readout) */}
        <section id="dashboard">
          <TelemetryHero
            stats={telemetryStats}
            config={config}
            currentTime={currentTime}
          />
        </section>

        {/* Section 2: Service Integrity Heatmap (Without bottom timeline line) */}
        <section id="heatmap">
          <ServiceHeatmap
            days={daysArray}
            stats={telemetryStats}
            config={config}
            onSelectDay={(day) => setSelectedDay(day)}
          />
        </section>
      </main>

      {/* Calibration Modal */}
      <CalibrationModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        config={config}
        onSave={handleSaveConfig}
      />

      {/* Individual Day Inspection Modal */}
      <DayDetailModal
        day={selectedDay}
        onClose={() => setSelectedDay(null)}
        totalDays={telemetryStats.totalDays}
      />

      {/* Export Summary Modal */}
      <ExportSummaryModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        stats={telemetryStats}
        config={config}
        currentTime={currentTime}
      />
    </div>
  );
}
