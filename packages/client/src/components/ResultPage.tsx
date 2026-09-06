import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { sound } from '../utils/sound';
import { GameResultSummary } from '@between-us/shared';
import { ShareCardModal } from './ShareCardModal';
import { Share2, RefreshCcw, Sparkles, Heart, CheckCircle2, Shield, Eye, Flame, Compass, ChevronDown, ChevronUp } from 'lucide-react';

interface ResultPageProps {
  result: GameResultSummary;
  onPlayAgain: () => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({ result, onPlayAgain }) => {
  const { t, getArchetype, getDynamic, getEnding, getChoiceText, locale, setLocale } = useI18n();
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  const dynamicInfo = getDynamic(result.coupleDynamic);
  const archAInfo = getArchetype(result.archetypeA);
  const archBInfo = getArchetype(result.archetypeB);
  const endingInfo = getEnding(result.ending);

  // MBTI Badge mapping for archetypes
  const archetypeBadges: Record<string, { code: string; color: string; bg: string; border: string; tags: string[] }> = {
    THE_GUARDIAN: { code: 'G-DEF', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', tags: ['ปกป้อง', 'ระมัดระวัง', 'ภักดี'] },
    THE_SEEKER: { code: 'S-TRU', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', tags: ['ค้นหาความจริง', 'ตรงไปตรงมา', 'เปิดเผย'] },
    THE_ANCHOR: { code: 'A-STB', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', tags: ['มั่นคง', 'ปลอดภัย', 'เข้าใจ'] },
    THE_MIRROR: { code: 'M-EMO', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', tags: ['สะท้อนใจ', 'เซนซิทีฟ', 'หยั่งรู้'] },
    THE_FREE_SOUL: { code: 'F-IND', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', tags: ['รักอิสระ', 'มีพื้นที่ส่วนตัว', 'จริงใจ'] },
    THE_WALL: { code: 'W-PRO', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30', tags: ['ระแวดระวัง', 'เกราะกำบัง', 'เก็บความรู้สึก'] },
    THE_HEALER: { code: 'H-RES', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', tags: ['ผู้เยียวยา', 'พร้อมให้อภัย', 'โอบอุ้ม'] },
    THE_FIRE: { code: 'F-PAS', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', tags: ['เร่าร้อน', 'ชัดเจน', 'อารมณ์แรง'] },
  };

  const badgeA = archetypeBadges[result.archetypeA] || { code: 'A-TYP', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', tags: ['บุคลิกภาพเฉพาะ'] };
  const badgeB = archetypeBadges[result.archetypeB] || { code: 'B-TYP', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', tags: ['บุคลิกภาพเฉพาะ'] };

  // Dimension Bars
  const dimensions = [
    { key: 'trust', label: 'ความไว้ใจ (Trust)', value: result.aggregateStats.trust, color: 'from-blue-500 to-cyan-400' },
    { key: 'honesty', label: 'ความซื่อสัตย์ (Honesty)', value: result.aggregateStats.honesty, color: 'from-amber-500 to-yellow-400' },
    { key: 'empathy', label: 'ความเข้าใจ (Empathy)', value: result.aggregateStats.empathy, color: 'from-emerald-500 to-teal-400' },
    { key: 'vulnerability', label: 'ความเปราะบาง (Vulnerability)', value: result.aggregateStats.vulnerability, color: 'from-rose-500 to-pink-400' },
    { key: 'closeness', label: 'ความใกล้ชิด (Closeness)', value: result.aggregateStats.closeness, color: 'from-purple-500 to-indigo-400' },
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 md:p-12 bg-radial-dark text-slate-100 font-thai">
      {/* Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-rose-900/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-3xl flex items-center justify-between z-10">
        <div className="text-xs font-mono tracking-widest text-slate-400 uppercase">
          BETWEEN US // RELATIONSHIP MBTI REPORT
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
            COUPLE DYNAMIC // เคมีระหว่างเรา
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

        {/* MBTI Archetypes Cards */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {/* Player A Card */}
          <div className={`p-6 md:p-7 rounded-3xl bg-black/40 backdrop-blur-xl border ${badgeA.border} shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-white/30 transition-all`}>
            <div className="absolute top-0 right-0 px-3.5 py-1 rounded-bl-2xl bg-white/5 border-l border-b border-white/10 text-[11px] font-mono tracking-widest text-slate-400">
              {badgeA.code}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-mono uppercase text-slate-400">
                  {locale === 'th' ? 'ผู้เล่น A' : 'PLAYER A'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                  {t('role_a')}
                </span>
              </div>

              <h3 className="text-2xl font-medium text-white mb-1">
                {archAInfo.name}
              </h3>
              <div className={`text-xs ${badgeA.color} font-mono mb-4`}>
                {archAInfo.subtitle}
              </div>

              {/* MBTI Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {badgeA.tags.map(tag => (
                  <span key={tag} className={`text-[10px] font-mono px-2.5 py-0.5 rounded-md ${badgeA.bg} ${badgeA.color} border ${badgeA.border}`}>
                    #{tag}
                  </span>
                ))}
              </div>

              <p className="text-xs md:text-sm text-slate-300 font-light leading-relaxed">
                {archAInfo.description}
              </p>
            </div>
          </div>

          {/* Player B Card */}
          <div className={`p-6 md:p-7 rounded-3xl bg-black/40 backdrop-blur-xl border ${badgeB.border} shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-white/30 transition-all`}>
            <div className="absolute top-0 right-0 px-3.5 py-1 rounded-bl-2xl bg-white/5 border-l border-b border-white/10 text-[11px] font-mono tracking-widest text-slate-400">
              {badgeB.code}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-mono uppercase text-slate-400">
                  {locale === 'th' ? 'ผู้เล่น B' : 'PLAYER B'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                  {t('role_b')}
                </span>
              </div>

              <h3 className="text-2xl font-medium text-white mb-1">
                {archBInfo.name}
              </h3>
              <div className={`text-xs ${badgeB.color} font-mono mb-4`}>
                {archBInfo.subtitle}
              </div>

              {/* MBTI Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {badgeB.tags.map(tag => (
                  <span key={tag} className={`text-[10px] font-mono px-2.5 py-0.5 rounded-md ${badgeB.bg} ${badgeB.color} border ${badgeB.border}`}>
                    #{tag}
                  </span>
                ))}
              </div>

              <p className="text-xs md:text-sm text-slate-300 font-light leading-relaxed">
                {archBInfo.description}
              </p>
            </div>
          </div>
        </div>

        {/* Relationship Trait Dimension Graphs */}
        <div className="w-full p-6 md:p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>มิติความสัมพันธ์ (RELATIONSHIP DIMENSIONS)</span>
            </span>
            <span className="text-xs font-mono text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              ความเข้ากันได้ {result.agreementRate}%
            </span>
          </div>

          {/* Animated Dimension Bars */}
          <div className="flex flex-col gap-4">
            {dimensions.map((dim) => (
              <div key={dim.key} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-light">{dim.label}</span>
                  <span className="font-mono text-white font-medium">{dim.value}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${dim.color} transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.max(5, Math.min(100, dim.value))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ending Narrative Box */}
        <div className="w-full p-6 md:p-8 rounded-3xl bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent border border-white/10 mb-8 shadow-2xl">
          <span className="text-[11px] font-mono uppercase text-amber-400/90 tracking-widest block mb-2">
            {t('ending_reached')}: {endingInfo.title}
          </span>
          <h4 className="text-xl md:text-2xl font-light text-white mb-2">
            {endingInfo.subtitle}
          </h4>
          <p className="text-sm md:text-base text-slate-300 font-light leading-relaxed">
            {endingInfo.narrative}
          </p>
        </div>

        {/* Decision History Timeline Breakdown */}
        <div className="w-full rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl mb-8">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full p-6 flex items-center justify-between hover:bg-white/[0.02] transition-all text-left"
          >
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-rose-400 block mb-1">
                การเปิดเผยความลับทั้งหมด (DECISION HISTORY)
              </span>
              <h4 className="text-base md:text-lg font-medium text-white">
                เกิดอะไรขึ้นเพราะใครเลือกอะไร?
              </h4>
            </div>
            {showHistory ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {showHistory && (
            <div className="px-6 pb-6 pt-2 flex flex-col gap-4 border-t border-white/5">
              {result.decisionHistory && result.decisionHistory.length > 0 ? (
                result.decisionHistory.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-rose-400 uppercase font-semibold">
                        บทที่ {item.chapter}
                      </span>
                      {item.impactDescription && (
                        <span className="text-[11px] font-mono text-amber-300/90 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                          {item.impactDescription}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                          ผู้เล่น A เลือก:
                        </span>
                        <p className="text-slate-200 font-light">
                          {getChoiceText(item.choiceA)}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                          ผู้เล่น B เลือก:
                        </span>
                        <p className="text-slate-200 font-light">
                          {getChoiceText(item.choiceB)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 font-mono text-center py-4">
                  บันทึกการตัดสินใจถูกรวมเข้ากับบทสรุปเรียบร้อยแล้ว
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="w-full flex flex-col md:flex-row gap-3">
          <button
            onClick={() => {
              sound.playClick();
              setShowModal(true);
            }}
            className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-medium flex items-center justify-center gap-2 border border-white/20 shadow-lg shadow-purple-950/40 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{t('share_card')}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onPlayAgain();
            }}
            className="py-4 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-normal flex items-center justify-center gap-2 transition-all cursor-pointer"
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

