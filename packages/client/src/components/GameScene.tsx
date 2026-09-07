import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { sound } from '../utils/sound';
import { ClientSharedState, ClientPrivateState, InteractiveHotspot } from '@between-us/shared';
import { Volume2, VolumeX, Loader2, Sparkles, Image as ImageIcon, Users } from 'lucide-react';
import { Scene3DCanvas } from './Scene3DCanvas';

interface GameSceneProps {
  shared: ClientSharedState;
  privateState: ClientPrivateState;
  availableChoices: string[];
  availableHotspots?: InteractiveHotspot[];
  onSubmitChoice: (choiceId: string) => void;
}

export const GameScene: React.FC<GameSceneProps> = ({
  shared,
  privateState,
  availableChoices,
  availableHotspots = [],
  onSubmitChoice
}) => {
  const { locale, setLocale, t, getScene, getChoiceText } = useI18n();
  const sceneData = getScene(shared.currentSceneId);
  const isPlayerA = privateState.role === 'playerA';

  // Determine asymmetric perspective text
  const narrativeText = sceneData.text;
  const perspectiveText = isPlayerA
    ? sceneData.playerA_perspective
    : sceneData.playerB_perspective;

  const promptText =
    sceneData.prompt ||
    (isPlayerA ? sceneData.prompt_A : sceneData.prompt_B);

  const hasChosen = privateState.hasChosen;
  const partnerChosen = isPlayerA ? shared.playerBChoiceSubmitted : shared.playerAChoiceSubmitted;

  // Scene artwork mapping
  const sceneImageMap: Record<string, string> = {
    ch1_intro: '/scenes/ch1_intro.jpg',
    ch1_observation: '/scenes/ch1_observation.jpg',
    ch2_phone_vibration: '/scenes/ch2_phone_vibration.jpg',
    ch2_phone_choice: '/scenes/ch2_phone_choice.jpg',
    ch3_confrontation: '/scenes/ch3_confrontation.jpg',
    ch5_vulnerability: '/scenes/ch5_vulnerability.jpg',
    ch6_breaking_point: '/scenes/ch6_breaking_point.jpg',
    ch7_final_question: '/scenes/ch7_final_question.jpg'
  };

  const currentBgImage = sceneImageMap[shared.currentSceneId] || '/scenes/ch1_intro.jpg';

  const handleSelectChoice = (choiceId: string) => {
    sound.playConfirm();
    onSubmitChoice(choiceId);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 md:p-8 text-slate-100 font-thai select-none overflow-x-hidden">
      {/* Ambient Visual Novel Blur Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center transition-all duration-1000 ease-out pointer-events-none scale-110 filter blur-lg opacity-40"
        style={{ backgroundImage: `url(${currentBgImage})` }}
      />
      
      {/* Cinematic Vignette & Dark Overlay Gradients */}
      <div className="fixed inset-0 bg-gradient-to-t from-[#06080d] via-[#06080d]/90 to-[#06080d]/80 pointer-events-none" />
      <div className="fixed inset-0 bg-radial-vignette pointer-events-none opacity-80" />

      {/* Top Scene Header */}
      <header className="w-full max-w-2xl flex items-center justify-between z-10 pt-2 mb-3">
        <div className="bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10">
          <span className="text-[11px] uppercase tracking-widest text-rose-400 font-mono block">
            {sceneData.chapter_title || `CHAPTER ${shared.chapter}`}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {isPlayerA ? t('role_a') : t('role_b')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Partner Status Pill */}
          <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 text-xs">
            <span className={`w-2 h-2 rounded-full ${partnerChosen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400/80'}`} />
            <span className="text-[11px] text-slate-300 font-mono">
              {partnerChosen ? 'อีกฝ่ายเลือกแล้ว' : 'อีกฝ่ายกำลังคิด'}
            </span>
          </div>

          <button
            onClick={() => sound.toggle()}
            className="p-2 rounded-xl border border-white/10 hover:border-white/30 bg-black/40 backdrop-blur-md transition-all text-slate-400 hover:text-white"
          >
            {sound.isEnabled() ? <Volume2 className="w-4 h-4 text-rose-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setLocale(locale === 'th' ? 'en' : 'th')}
            className="px-2.5 py-1 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md text-xs font-mono text-slate-300"
          >
            {locale.toUpperCase()}
          </button>
        </div>
      </header>

      {/* Main 3D Stage & Interactive Action Section */}
      <main className="w-full max-w-2xl flex flex-col items-center my-auto z-10 py-1 animate-fade-in">
        {/* Full 3D Interactive WebGL Table Canvas */}
        <div className="w-full mb-3">
          <Scene3DCanvas
            sceneId={shared.currentSceneId}
            chapter={shared.chapter}
            role={privateState.role}
            hotspots={availableHotspots}
            onSelectAction={handleSelectChoice}
            activeAction={shared.activeAction}
            hasChosen={hasChosen}
            locale={locale}
          />
        </div>

        {/* Diegetic Concise Narrative & Perspective Pill */}
        {perspectiveText && (
          <div className="w-full mb-3 px-4 py-3 rounded-2xl bg-black/70 backdrop-blur-xl border border-rose-500/30 shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0 animate-pulse" />
              <p className="text-xs md:text-sm text-slate-200 font-light truncate">
                {perspectiveText}
              </p>
            </div>
            <span className="text-[9px] uppercase tracking-widest font-mono text-rose-300/70 shrink-0">
              {isPlayerA ? 'A' : 'B'}
            </span>
          </div>
        )}

        {/* Major Decision Alert (Critical divergence point) */}
        {shared.majorChoicePrompt && (
          <div className="w-full mb-3 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-400/40 backdrop-blur-md flex items-center gap-2.5 text-amber-200 animate-pulse-slow shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-mono font-medium leading-tight">
              {shared.majorChoicePrompt}
            </span>
          </div>
        )}

        {/* Prompt */}
        {promptText && (
          <div className="text-xs md:text-sm tracking-wide font-mono text-rose-200/90 mb-4 text-center px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            {promptText}
          </div>
        )}

        {/* Choice list or Waiting Screen */}
        <div className="w-full flex flex-col gap-2.5">
          {!hasChosen ? (
            availableChoices.map((cId) => {
              const isSignificant = cId !== 'continue';
              return (
                <button
                  key={cId}
                  onClick={() => handleSelectChoice(cId)}
                  className={`w-full text-left p-4 rounded-xl backdrop-blur-md border text-slate-200 hover:text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-light text-sm md:text-base leading-snug group shadow-lg cursor-pointer relative overflow-hidden ${
                    shared.majorChoicePrompt
                      ? 'bg-black/60 hover:bg-black/80 border-amber-400/30 hover:border-amber-400/80 shadow-amber-950/20'
                      : 'bg-black/50 hover:bg-black/75 border-white/15 hover:border-rose-400/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 font-mono text-xs ${
                        shared.majorChoicePrompt ? 'text-amber-400' : 'text-rose-400/70 group-hover:text-rose-400'
                      }`}>
                        ✦
                      </span>
                      <span>{getChoiceText(cId)}</span>
                    </div>

                    {shared.majorChoicePrompt && isSignificant && (
                      <span className="shrink-0 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/25 ml-2 mt-0.5">
                        ส่งผลต่อเนื้อเรื่อง
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="w-full py-8 px-6 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 flex flex-col items-center justify-center text-center animate-fade-in shadow-2xl">
              <Loader2 className="w-6 h-6 text-rose-400 animate-spin mb-3" />
              <div className="text-sm text-slate-200 font-medium mb-1">
                {t('choice_submitted')}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {partnerChosen ? 'ทั้งสองคนเลือกแล้ว กำลังเปิดเผยผล...' : t('simultaneous_waiting')}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer hint */}
      <footer className="w-full max-w-2xl flex items-center justify-between text-[11px] text-slate-400/80 font-mono z-10 pb-1">
        <span>Room: {shared.roomCode}</span>
        <span>Visual Narrative Mode</span>
      </footer>
    </div>
  );
};
