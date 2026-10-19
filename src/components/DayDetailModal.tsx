import React, { useState, useEffect } from 'react';
import { DayInfo } from '../types/telemetry';
import { X, Calendar, Shield, Save, Tag } from 'lucide-react';
import { tacticalAudio } from '../utils/audio';

interface DayDetailModalProps {
  day: DayInfo | null;
  onClose: () => void;
  totalDays: number;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  day,
  onClose,
  totalDays,
}) => {
  const [note, setNote] = useState<string>('');
  const [tag, setTag] = useState<string>('');

  useEffect(() => {
    if (day) {
      const storedNote = localStorage.getItem(`tactical_day_note_${day.dateString}`) || '';
      const storedTag = localStorage.getItem(`tactical_day_tag_${day.dateString}`) || '';
      setNote(storedNote);
      setTag(storedTag);
    }
  }, [day]);

  if (!day) return null;

  const handleSave = () => {
    tacticalAudio.playConfirm();
    localStorage.setItem(`tactical_day_note_${day.dateString}`, note);
    localStorage.setItem(`tactical_day_tag_${day.dateString}`, tag);
    onClose();
  };

  const quickTags = [
    'Guard Duty',
    'Weekend Pass',
    'Field Exercise',
    'Physical Test',
    'Medical Sick Call',
    'Routine Duty',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[#12181f] border border-[#1e2630] rounded-lg max-w-md w-full p-6 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative text-[#dde3ed]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1e2630]">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#54ddfc]" />
            <h3 className="text-base font-space font-bold tracking-wide text-white uppercase">
              DAY {day.dayIndex} OF {totalDays}
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

        {/* Content */}
        <div className="mt-4 space-y-4">
          <div className="bg-[#0e141b] p-3 rounded border border-[#1e2630] text-xs font-mono-hud space-y-1">
            <div className="text-white font-medium text-sm">
              {day.date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[#94a3b8]">STATUS:</span>
              <span
                className={`font-semibold uppercase ${
                  day.status === 'served'
                    ? 'text-[#4edea3]'
                    : day.status === 'current'
                    ? 'text-[#ffc174]'
                    : 'text-[#94a3b8]'
                }`}
              >
                {day.status === 'served'
                  ? 'SERVED & CLEARED'
                  : day.status === 'current'
                  ? 'CURRENT ACTIVE DUTY'
                  : 'FUTURE SCHEDULED'}
              </span>
            </div>
            {day.milestoneTitle && (
              <div className="text-[#ffc174] pt-1 font-semibold">
                MILESTONE: {day.milestoneTitle}
              </div>
            )}
          </div>

          {/* Quick tags */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono-hud text-[#94a3b8] uppercase tracking-wider block">
              DUTY / PASS CLASSIFICATION
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    tacticalAudio.playHover();
                    setTag(t);
                  }}
                  className={`text-[10px] font-mono-hud px-2 py-1 rounded transition-colors ${
                    tag === t
                      ? 'bg-[#f59e0b] text-[#0b0f12] font-semibold'
                      : 'bg-[#0e141b] text-[#94a3b8] border border-[#1e2630] hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono-hud text-[#94a3b8] uppercase tracking-wider block">
              OPERATIONAL LOG / PERSONAL NOTE
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Record duty post, watch hours, physical events, or memorable milestones..."
              rows={3}
              className="w-full bg-[#0e141b] border border-[#1e2630] rounded p-2.5 text-xs font-mono-hud text-white focus:outline-none focus:border-[#54ddfc]"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#1e2630] flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-mono-hud text-[#94a3b8] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono-hud font-bold text-[#0b0f12] bg-[#4edea3] hover:bg-[#6ffbbe] rounded transition-all uppercase"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Log</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
