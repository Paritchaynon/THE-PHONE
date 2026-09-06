import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { sound } from '../utils/sound';
import { ClientSharedState, ClientPrivateState } from '@between-us/shared';
import { Volume2, VolumeX, Globe, Loader2, Sparkles } from 'lucide-react';

interface GameSceneProps {
  shared: ClientSharedState;
  privateState: ClientPrivateState;
  availableChoices: string[];
  onSubmitChoice: (choiceId: string) => void;
}

export const GameScene: React.FC<GameSceneProps> = ({
  shared,
  privateState,
  availableChoices,
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

  const handleSelectChoice = (choiceId: string) => {
    sound.playConfirm();
    onSubmitChoice(choiceId);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 md:p-12 bg-radial-dark text-slate-100 font-thai select-none">
      {/* Cinematic subtle light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-rose-950/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Scene Header */}
      <header className="w-full max-w-2xl flex items-center justify-between z-10">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-400 font-mono block">
            {sceneData.chapter_title || `CHAPTER ${shared.chapter}`}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {isPlayerA ? t('role_a') : t('role_b')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => sound.toggle()}
            className="p-2 rounded-full border border-white/10 hover:border-white/30 bg-white/5 transition-all text-slate-400 hover:text-white"
          >
            {sound.isEnabled() ? <Volume2 className="w-4 h-4 text-rose-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setLocale(locale === 'th' ? 'en' : 'th')}
            className="px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-slate-300"
          >
            {locale.toUpperCase()}
          </button>
        </div>
      </header>

      {/* Narrative & Perspective Centerpiece */}
      <main className="w-full max-w-2xl flex flex-col items-center my-auto z-10 py-6">
        {/* Shared ambient narrative (if present) */}
        {narrativeText && (
          <div className="mb-6 p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-slate-300 text-sm md:text-base leading-relaxed tracking-wide text-center">
            {narrativeText}
          </div>
        )}

        {/* Asymmetric Private Perspective */}
        {perspectiveText && (
          <div className="w-full mb-8 p-6 md:p-8 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 shadow-2xl">
            <span className="text-[10px] tracking-widest font-mono uppercase text-rose-400/90 block mb-2">
              YOUR PERSPECTIVE
            </span>
            <p className="text-base md:text-lg text-slate-100 font-light leading-relaxed">
              {perspectiveText}
            </p>
          </div>
        )}

        {/* Prompt */}
        {promptText && (
          <div className="text-xs md:text-sm tracking-wide font-mono text-slate-400 mb-6 text-center">
            {promptText}
          </div>
        )}

        {/* Choice list or Waiting Screen */}
        <div className="w-full flex flex-col gap-3">
          {!hasChosen ? (
            availableChoices.map((cId) => (
              <button
                key={cId}
                onClick={() => handleSelectChoice(cId)}
                className="w-full text-left p-4 md:p-5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/10 hover:border-rose-400/50 text-slate-200 hover:text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-light text-sm md:text-base leading-snug group shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="text-rose-400/50 group-hover:text-rose-400 mt-0.5 font-mono text-xs">
                    ✦
                  </span>
                  <span>{getChoiceText(cId)}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="w-full py-8 px-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col items-center justify-center text-center animate-fade-in">
              <Loader2 className="w-6 h-6 text-rose-400 animate-spin mb-3" />
              <div className="text-sm text-slate-300 font-medium mb-1">
                {t('choice_submitted')}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {t('simultaneous_waiting')}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer hint */}
      <footer className="w-full max-w-2xl flex items-center justify-between text-[11px] text-slate-600 font-mono z-10">
        <span>Room: {shared.roomCode}</span>
        <span>Asymmetric Private Isolation</span>
      </footer>
    </div>
  );
};
