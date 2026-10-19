import React, { useState } from 'react';
import { TelemetryStats, ServiceConfig } from '../types/telemetry';
import { X, Copy, Check, Printer, Shield, Terminal } from 'lucide-react';
import { tacticalAudio } from '../utils/audio';

interface ExportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TelemetryStats;
  config: ServiceConfig;
  currentTime: Date;
}

export const ExportSummaryModal: React.FC<ExportSummaryModalProps> = ({
  isOpen,
  onClose,
  stats,
  config,
  currentTime,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const summaryText = `[ARMY REDEMPTION // TACTICAL SERVICE TELEMETRY]
==================================================
CALLSIGN: ${config.callsign}
SERVICE DURATION: ${config.startDate} TO ${config.endDate}
TIMESTAMP: ${currentTime.toISOString()}

CURRENT METRICS:
- TOTAL DAYS: ${stats.totalDays}
- SERVED: ${stats.daysServed} (${stats.percentComplete.toFixed(2)}%)
- REMAINING: ${stats.daysRemaining} DAYS
- WEEKS LEFT: ${stats.weeksRemaining}
- HOURS LEFT: ${stats.hoursRemaining.toLocaleString()}
- MINUTES LEFT: ${stats.minutesRemaining.toLocaleString()}
- TERMINAL LEAVE TARGET: ${stats.targetTerminalLeaveDate}

STATUS: ${stats.isCompleted ? 'DISCHARGED // REDEEMED' : 'T-MINUS RUNNING'}
==================================================`;

  const handleCopy = () => {
    tacticalAudio.playConfirm();
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    tacticalAudio.playConfirm();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[#12181f] border border-[#1e2630] rounded-lg max-w-lg w-full p-6 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative text-[#dde3ed]"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#1e2630]">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#4edea3]" />
            <h3 className="text-base font-space font-bold tracking-wide text-white uppercase">
              TACTICAL SERVICE DOSSIER
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

        {/* Monospaced Dossier Preview */}
        <div className="mt-4 bg-[#090f15] border border-[#1e2630] rounded p-4 font-mono-hud text-xs text-[#4edea3] whitespace-pre-wrap select-all leading-relaxed max-h-72 overflow-y-auto">
          {summaryText}
        </div>

        {/* Actions */}
        <div className="mt-5 pt-4 border-t border-[#1e2630] flex items-center justify-between">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono-hud text-[#94a3b8] hover:text-white bg-[#0e141b] rounded border border-[#1e2630] transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono-hud font-bold text-[#0b0f12] bg-[#ffc174] hover:bg-[#ffddb8] rounded transition-all uppercase shadow-[0_0_12px_rgba(255,193,116,0.3)]"
            >
              {copied ? <Check className="w-4 h-4 text-[#0b0f12]" /> : <Copy className="w-4 h-4 text-[#0b0f12]" />}
              <span>{copied ? 'Copied' : 'Copy Dossier'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
