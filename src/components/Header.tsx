import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sliders, Calendar, Download } from 'lucide-react';
import { tacticalAudio } from '../utils/audio';
import { ServiceConfig } from '../types/telemetry';

interface HeaderProps {
  config: ServiceConfig;
  onOpenCalibration: () => void;
  onOpenExport: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onOpenCalibration,
  onOpenExport,
  activeSection,
  onNavigate,
}) => {
  const [isMuted, setIsMuted] = useState(tacticalAudio.getMuted());
  const [timeUtc, setTimeUtc] = useState<string>('');
  const [timeLocal, setTimeLocal] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().slice(17, 25) + ' Z');
      setTimeLocal(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleSound = () => {
    const muted = tacticalAudio.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="flex items-center justify-between gap-4 md:gap-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-[#1e2630] bg-[#0b0f12]/95 backdrop-blur-md sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a 
          href="#top" 
          onClick={(e) => {
            e.preventDefault();
            onNavigate('dashboard');
          }}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <span className="text-xl sm:text-2xl font-cinzel font-black tracking-wider text-white">
            ARMY
          </span>
          <span className="text-xl sm:text-2xl font-cinzel font-black tracking-wider bg-gradient-to-r from-[#ffddb8] via-[#ffb95f] to-[#f59e0b] bg-clip-text text-transparent">
            REDEMPTION
          </span>
        </a>

        {/* Live Zulu / Local Time Ticker */}
        <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-[#1e2630] text-[11px] font-mono-hud text-[#94a3b8]">
          <span className="text-[#a08e7a]">ZULU:</span>
          <span className="text-white font-medium">{timeUtc}</span>
          <span className="text-[#343a41]">|</span>
          <span className="text-[#a08e7a]">LOCAL:</span>
          <span className="text-[#54ddfc] font-medium">{timeLocal}</span>
        </div>
      </div>

      {/* Zone 2: 4-5 concise navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-mono-hud tracking-wider text-[#94a3b8] uppercase">
        <button
          onClick={() => {
            tacticalAudio.playHover();
            onNavigate('dashboard');
          }}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeSection === 'dashboard' ? 'border-[#ffb95f] text-white font-semibold' : 'border-transparent'
          }`}
        >
          Telemetry
        </button>
        <button
          onClick={() => {
            tacticalAudio.playHover();
            onNavigate('heatmap');
          }}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeSection === 'heatmap' ? 'border-[#ffb95f] text-white font-semibold' : 'border-transparent'
          }`}
        >
          Audit Heatmap
        </button>
        <button
          onClick={() => {
            tacticalAudio.playHover();
            onNavigate('milestones');
          }}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeSection === 'milestones' ? 'border-[#ffb95f] text-white font-semibold' : 'border-transparent'
          }`}
        >
          Milestones
        </button>
        <button
          onClick={() => {
            tacticalAudio.playConfirm();
            onOpenExport();
          }}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent flex items-center gap-1.5"
        >
          <Download className="w-3 h-3 text-[#4edea3]" />
          <span>Export Dossier</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action + HUD sound control */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Audio Mute Button */}
        <button
          onClick={handleToggleSound}
          title={isMuted ? 'Enable Tactical Audio' : 'Mute Tactical Audio'}
          className="p-2 rounded text-[#94a3b8] hover:text-white bg-[#12181f] border border-[#1e2630] hover:border-[#2a3441] transition-colors"
          aria-label="Toggle Sound"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-[#94a3b8]" /> : <Volume2 className="w-4 h-4 text-[#ffb95f]" />}
        </button>

        {/* Primary Action Button */}
        <button
          onClick={() => {
            tacticalAudio.playConfirm();
            onOpenCalibration();
          }}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-mono-hud font-semibold text-[#0b0f12] bg-[#f59e0b] hover:bg-[#ffb95f] rounded transition-all duration-150 shadow-[0_0_12px_rgba(245,158,11,0.3)] whitespace-nowrap shrink-0 uppercase"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Calibrate Dates</span>
        </button>
      </div>
    </header>
  );
};
