import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { sound } from '../utils/sound';
import { Volume2, VolumeX, Globe, HeartHandshake, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  loading: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onCreateRoom, onJoinRoom, loading }) => {
  const { locale, setLocale, t } = useI18n();
  const [roomCode, setRoomCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [audioActive, setAudioActive] = useState(sound.isEnabled());

  const handleToggleAudio = () => {
    const newState = sound.toggle();
    setAudioActive(newState);
  };

  const handleToggleLang = () => {
    sound.playClick();
    setLocale(locale === 'th' ? 'en' : 'th');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 bg-radial-dark text-slate-100 overflow-hidden font-thai selection:bg-rose-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-rose-900/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-xs tracking-widest text-slate-400 font-mono">
          <HeartHandshake className="w-4 h-4 text-rose-400/80" />
          <span>BETWEEN US // 2-PLAYER CO-OP</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleAudio}
            className="p-2 rounded-full border border-white/10 hover:border-white/30 bg-white/5 transition-all text-slate-300 hover:text-white"
            title={t('audio_toggle')}
          >
            {audioActive ? <Volume2 className="w-4 h-4 text-rose-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={handleToggleLang}
            className="flex items-center gap-1 px-3 py-1 rounded-full border border-white/10 hover:border-white/30 bg-white/5 text-xs font-mono tracking-wider transition-all text-slate-200"
          >
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>{locale.toUpperCase()}</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-md flex flex-col items-center text-center my-auto z-10">
        <h1 className="text-4xl md:text-5xl font-extralight tracking-widest text-white/95 mb-4">
          BETWEEN US
        </h1>
        <p className="text-sm md:text-base text-slate-400 font-light leading-relaxed mb-10 max-w-sm">
          {t('tagline')}
        </p>

        {!showJoinInput ? (
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onCreateRoom();
              }}
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-rose-500/80 to-purple-600/80 hover:from-rose-500 hover:to-purple-600 font-medium tracking-wide text-white shadow-lg shadow-purple-950/40 border border-white/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              {loading ? '...' : t('create_room')}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setShowJoinInput(true);
              }}
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-normal tracking-wide text-slate-200 transition-all"
            >
              {t('join_room')}
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-3 animate-fade-in">
            <div className="relative w-full">
              <input
                type="text"
                maxLength={6}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder={t('enter_code')}
                className="w-full py-4 px-4 text-center font-mono text-lg tracking-widest rounded-xl bg-black/40 border border-white/20 focus:border-rose-400 focus:outline-none text-white placeholder:text-slate-600"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setShowJoinInput(false);
                }}
                className="py-3 px-4 rounded-xl border border-white/10 text-slate-400 hover:text-white bg-white/5 text-sm transition-all"
              >
                Back
              </button>

              <button
                onClick={() => {
                  if (roomCode.trim().length >= 4) {
                    sound.playConfirm();
                    onJoinRoom(roomCode.trim());
                  }
                }}
                disabled={loading || roomCode.trim().length < 4}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-500/80 hover:bg-rose-500 font-medium text-white flex items-center justify-center gap-2 border border-white/20 transition-all disabled:opacity-40"
              >
                <span>{loading ? '...' : t('join_room')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer info */}
      <footer className="w-full max-w-4xl flex items-center justify-between text-[11px] text-slate-600 font-mono z-10 pt-6">
        <span>Authoritative Realtime Experience</span>
        <span>Thai & English Synchronized</span>
      </footer>
    </div>
  );
};
