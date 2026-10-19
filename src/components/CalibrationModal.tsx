import React, { useState } from 'react';
import { ServiceConfig } from '../types/telemetry';
import { DEFAULT_CONFIGS } from '../utils/telemetryCalculator';
import { X, Sliders, Calendar, RotateCcw, Check } from 'lucide-react';
import { tacticalAudio } from '../utils/audio';

interface CalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ServiceConfig;
  onSave: (newConfig: ServiceConfig) => void;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [formData, setFormData] = useState<ServiceConfig>({ ...config });
  const [selectedPresetId, setSelectedPresetId] = useState<string>(config.id);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: ServiceConfig) => {
    setSelectedPresetId(preset.id);
    setFormData({
      ...preset,
      terminalLeaveDays: formData.terminalLeaveDays || preset.terminalLeaveDays,
    });
    tacticalAudio.playHover();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    tacticalAudio.playConfirm();
    onSave(formData);
    onClose();
  };

  const handleReset = () => {
    tacticalAudio.playConfirm();
    const def = DEFAULT_CONFIGS[0];
    setFormData({ ...def });
    setSelectedPresetId(def.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[#12181f] border border-[#1e2630] rounded-lg max-w-lg w-full p-6 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative text-[#dde3ed]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1e2630]">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#f59e0b]" />
            <h3 className="text-lg font-space font-bold tracking-wide text-white uppercase">
              CALIBRATE SERVICE DATES
            </h3>
          </div>
          <button
            onClick={() => {
              tacticalAudio.playHover();
              onClose();
            }}
            className="text-[#94a3b8] hover:text-white p-1 rounded hover:bg-[#1a2027] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Preset Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-mono-hud text-[#94a3b8] uppercase tracking-wider block">
              OPERATIONAL PRESETS
            </label>
            <div className="grid grid-cols-1 gap-2">
              {DEFAULT_CONFIGS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded text-left text-xs font-mono-hud transition-all border ${
                      isSelected
                        ? 'bg-[#1a2027] border-[#f59e0b] text-[#ffc174] shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                        : 'bg-[#0e141b] border-[#1e2630] text-[#dde3ed] hover:border-[#2a3441]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{preset.presetName}</div>
                      <div className="text-[11px] text-[#94a3b8]">
                        {preset.startDate} ➔ {preset.endDate}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#f59e0b] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono-hud text-[#94a3b8] uppercase tracking-wider block">
                START DATE (INDUCTION)
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  setFormData({ ...formData, startDate: e.target.value });
                  setSelectedPresetId('custom');
                }}
                className="w-full bg-[#0e141b] border border-[#1e2630] rounded px-3 py-2 text-xs font-mono-hud text-white focus:outline-none focus:border-[#f59e0b]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono-hud text-[#94a3b8] uppercase tracking-wider block">
                END DATE (REDEMPTION)
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => {
                  setFormData({ ...formData, endDate: e.target.value });
                  setSelectedPresetId('custom');
                }}
                className="w-full bg-[#0e141b] border border-[#1e2630] rounded px-3 py-2 text-xs font-mono-hud text-white focus:outline-none focus:border-[#f59e0b]"
                required
              />
            </div>
          </div>

          {/* Terminal Leave Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono-hud">
              <label className="text-[#94a3b8] uppercase tracking-wider">
                TERMINAL LEAVE ACCRUAL
              </label>
              <span className="text-[#ffc174] font-bold">
                {formData.terminalLeaveDays} DAYS
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="45"
              step="1"
              value={formData.terminalLeaveDays}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  terminalLeaveDays: parseInt(e.target.value, 10) || 0,
                })
              }
              className="w-full accent-[#f59e0b] bg-[#0e141b] h-1.5 rounded cursor-pointer"
            />
            <p className="text-[11px] text-[#94a3b8]">
              Terminal leave subtracts official duty days prior to your discharge date, allowing earlier departure.
            </p>
          </div>

          {/* Callsign / Unit */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono-hud text-[#94a3b8] uppercase tracking-wider block">
              SERVICE CALLSIGN / UNIT
            </label>
            <input
              type="text"
              value={formData.callsign}
              onChange={(e) => setFormData({ ...formData, callsign: e.target.value })}
              placeholder="e.g. SPECIAL RECRUIT // AIR DEFENSE"
              className="w-full bg-[#0e141b] border border-[#1e2630] rounded px-3 py-2 text-xs font-mono-hud text-white focus:outline-none focus:border-[#f59e0b]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#1e2630] flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-mono-hud text-[#94a3b8] hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  tacticalAudio.playHover();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-mono-hud text-[#94a3b8] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-mono-hud font-bold text-[#0b0f12] bg-[#f59e0b] hover:bg-[#ffb95f] rounded transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)] uppercase"
              >
                Apply Calibration
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
