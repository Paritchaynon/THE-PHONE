import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { sound } from '../utils/sound';
import { GameResultSummary } from '@between-us/shared';
import { ShareCardModal } from './ShareCardModal';
import { Share2, RefreshCcw, Sparkles, Heart, CheckCircle } from 'lucide-react';

interface ResultPageProps {
  result: GameResultSummary;
  onPlayAgain: () => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({ result, onPlayAgain }) => {
  const { t, getArchetype, getDynamic, getEnding, locale, setLocale } = useI18n();
  const [showModal, setShowModal] = useState(false);

  const dynamicInfo = getDynamic(result.coupleDynamic);
  const archAInfo = getArchetype(result.archetypeA);
  const archBInfo = getArchetype(result.archetypeB);
  const endingInfo = getEnding(result.ending);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 md:p-12 bg-radial-dark text-slate-100 font-thai">
      {/* Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-rose-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-3xl flex items-center justify-between z-10">
        <div className="text-xs font-mono tracking-widest text-slate-400 uppercase">
          BETWEEN US // ANALYSIS
        </div>
        <button
          onClick={() => setLocale(locale === 'th' ? 'en' : 'th')}
          className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-slate-300"
        >
          {locale.toUpperCase()}
        </button>
      </header>

      {/* Main Analysis Results */}
      <main className="w-full max-w-3xl flex flex-col items-center my-8 z-10">
        {/* Couple Dynamic Highlight */}
        <div className="w-full p-8 md:p-10 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl text-center mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent" />

          <span className="text-xs font-mono uppercase tracking-widest text-rose-400 block mb-2">
            COUPLE DYNAMIC
          </span>
          <h1 className="text-3xl md:text-5xl font-light tracking-wide text-white mb-3">
            {dynamicInfo.name}
          </h1>
          <p className="text-base md:text-lg text-rose-200/90 font-light italic max-w-lg mx-auto mb-6">
            “{dynamicInfo.quote}”
          </p>

          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-400">
            {dynamicInfo.subtitle}
          </div>
        </div>

        {/* Archetypes Comparison */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Player A */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                {locale === 'th' ? 'ผู้เล่น A' : 'PLAYER A'}
              </span>
              <h3 className="text-xl font-medium text-white mb-1">
                {archAInfo.name}
              </h3>
              <div className="text-xs text-rose-400/90 font-mono mb-3">
                {archAInfo.subtitle}
              </div>
              <p className="text-xs md:text-sm text-slate-300 font-light leading-relaxed">
                {archAInfo.description}
              </p>
            </div>
          </div>

          {/* Player B */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                {locale === 'th' ? 'ผู้เล่น B' : 'PLAYER B'}
              </span>
              <h3 className="text-xl font-medium text-white mb-1">
                {archBInfo.name}
              </h3>
              <div className="text-xs text-purple-400/90 font-mono mb-3">
                {archBInfo.subtitle}
              </div>
              <p className="text-xs md:text-sm text-slate-300 font-light leading-relaxed">
                {archBInfo.description}
              </p>
            </div>
          </div>
        </div>

        {/* Ending Narrative */}
        <div className="w-full p-6 md:p-8 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 mb-8">
          <span className="text-[11px] font-mono uppercase text-amber-400/90 tracking-widest block mb-2">
            {t('ending_reached')}: {endingInfo.title}
          </span>
          <h4 className="text-lg md:text-xl font-light text-white mb-2">
            {endingInfo.subtitle}
          </h4>
          <p className="text-sm md:text-base text-slate-300 font-light leading-relaxed">
            {endingInfo.narrative}
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="w-full p-6 rounded-2xl bg-white/[0.02] border border-white/5 mb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block mb-4">
            RELATIONSHIP METRICS
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-[11px] font-mono text-slate-500 block">TRUST</span>
              <div className="text-lg font-mono text-white font-medium">
                {result.aggregateStats.trust}%
              </div>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-500 block">HONESTY</span>
              <div className="text-lg font-mono text-white font-medium">
                {result.aggregateStats.honesty}%
              </div>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-500 block">VULNERABILITY</span>
              <div className="text-lg font-mono text-white font-medium">
                {result.aggregateStats.vulnerability}%
              </div>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-500 block">AGREEMENT</span>
              <div className="text-lg font-mono text-emerald-400 font-medium">
                {result.agreementRate}%
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="w-full flex flex-col md:flex-row gap-3">
          <button
            onClick={() => {
              sound.playClick();
              setShowModal(true);
            }}
            className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-medium flex items-center justify-center gap-2 border border-white/20 shadow-lg shadow-purple-950/40 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>{t('share_card')}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onPlayAgain();
            }}
            className="py-4 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-normal flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>{t('play_again')}</span>
          </button>
        </div>
      </main>

      {/* Share Card Modal */}
      {showModal && (
        <ShareCardModal result={result} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};
