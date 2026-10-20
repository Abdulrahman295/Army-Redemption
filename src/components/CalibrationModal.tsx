import React, { useState, useEffect, useRef } from 'react';
import { ServiceConfig } from '../types/telemetry';
import { DEFAULT_CONFIGS } from '../utils/telemetryCalculator';
import { X, Sliders, RotateCcw } from 'lucide-react';
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

  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Escape to close, trap Tab focus, restore focus to the trigger on close
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusables = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>('button, input, [href], [tabindex]:not([tabindex="-1"])') ?? []
      ).filter((el) => !el.hasAttribute('disabled'));
    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div 
        className="bg-surface border border-line rounded-lg max-w-lg w-full p-6 relative text-fg"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="calibration-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-accent" />
            <h3 id="calibration-title" className="text-lg font-display font-bold tracking-wide text-white uppercase">
              CALIBRATE SERVICE DATES
            </h3>
          </div>
          <button
            onClick={() => {
              tacticalAudio.playHover();
              onClose();
            }}
            className="text-muted hover:text-white p-1 rounded hover:bg-raised transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Date Range Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="calibration-startDate" className="text-xs font-mono-hud text-muted uppercase tracking-wider block">
                START DATE (INDUCTION)
              </label>
              <input
                id="calibration-startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-inset border border-line rounded px-3 py-2 text-xs font-mono-hud text-white focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="calibration-endDate" className="text-xs font-mono-hud text-muted uppercase tracking-wider block">
                END DATE (REDEMPTION)
              </label>
              <input
                id="calibration-endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-inset border border-line rounded px-3 py-2 text-xs font-mono-hud text-white focus:outline-none focus:border-accent"
                required
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-line flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-mono-hud text-muted hover:text-white transition-colors"
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
                className="px-4 py-2 text-xs font-mono-hud text-muted hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-mono-hud font-bold text-base bg-accent hover:bg-accent-hover rounded transition-colors uppercase"
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
