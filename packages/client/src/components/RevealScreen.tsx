import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { sound } from '../utils/sound';
import { ClientSharedState, ClientPrivateState } from '@between-us/shared';
import { Eye, ArrowRight, CheckCircle2, Loader2, Sparkles, Users } from 'lucide-react';

interface RevealScreenProps {
  shared: ClientSharedState;
  privateState: ClientPrivateState;
  onContinue: () => void;
}

export const RevealScreen: React.FC<RevealScreenProps> = ({ shared, privateState, onContinue }) => {
  const { t, getChoiceText } = useI18n();
  const isPlayerA = privateState.role === 'playerA';

  const myContinued = isPlayerA ? Boolean(shared.playerAContinued) : Boolean(shared.playerBContinued);
  const partnerContinued = isPlayerA ? Boolean(shared.playerBContinued) : Boolean(shared.playerAContinued);

  const myChoiceText = isPlayerA
    ? getChoiceText(shared.revealedChoiceA || '')
    : getChoiceText(shared.revealedChoiceB || '');

  const partnerChoiceText = isPlayerA
    ? getChoiceText(shared.revealedChoiceB || '')
    : getChoiceText(shared.revealedChoiceA || '');

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 md:p-12 bg-radial-dark text-slate-100 font-thai">
      {/* Visual Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col items-center shadow-2xl relative z-10 animate-fade-in">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-rose-400 mb-2">
          <Eye className="w-4 h-4" />
          <span>{t('revealed_title')}</span>
        </div>

        <h2 className="text-xl md:text-2xl font-light text-white mb-4 text-center">
          ช่วงเวลาแห่งการเปิดเผย
        </h2>

        {/* Narrative Trajectory Shift Notification Banner */}
        {shared.lastShiftDescription && (
          <div className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 border border-amber-400/30 backdrop-blur-md flex items-start gap-3 shadow-lg animate-pulse-slow">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-300 font-bold block mb-1">
                การเปลี่ยนแปลงของเส้นเรื่อง (STORY TRAJECTORY SHIFT)
              </span>
              <p className="text-xs md:text-sm text-slate-200 font-light leading-relaxed">
                {shared.lastShiftDescription}
              </p>
            </div>
          </div>
        )}

        {/* Decisions comparison */}
        <div className="w-full flex flex-col gap-4 mb-6">
          {/* My Choice */}
          <div className="p-4 md:p-5 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase text-slate-400">
                {t('your_choice')}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                {isPlayerA ? t('role_a') : t('role_b')}
              </span>
            </div>
            <p className="text-sm md:text-base text-white font-light leading-relaxed">
              {myChoiceText || '...'}
            </p>
          </div>

          {/* Partner Choice */}
          <div className="p-4 md:p-5 rounded-2xl bg-rose-500/[0.05] border border-rose-500/20 relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase text-rose-300">
                {t('partner_chose')}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                {isPlayerA ? t('role_b') : t('role_a')}
              </span>
            </div>
            <p className="text-sm md:text-base text-rose-100 font-light leading-relaxed">
              {partnerChoiceText || '...'}
            </p>
          </div>
        </div>

        {/* Both Player Status & Notification Banner */}
        <div className="w-full mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-rose-400" />
              <span>{t('continue_both_hint')}</span>
            </div>
            <span className="text-[11px] text-rose-400/90 font-medium">
              {[myContinued, partnerContinued].filter(Boolean).length}/2 พร้อมแล้ว
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
              myContinued
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}>
              {myContinued ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-slate-500 shrink-0" />
              )}
              <span className="truncate">คุณ: {myContinued ? 'กดยืนยันแล้ว' : 'ยังไม่กด'}</span>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
              partnerContinued
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}>
              {partnerContinued ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-slate-500 shrink-0" />
              )}
              <span className="truncate">อีกฝ่าย: {partnerContinued ? 'กดยืนยันแล้ว' : 'กำลังอ่าน...'}</span>
            </div>
          </div>
        </div>

        {/* Continue Action */}
        {!myContinued ? (
          <button
            onClick={() => {
              sound.playClick();
              onContinue();
            }}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-medium tracking-wide flex items-center justify-center gap-2 border border-white/20 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-rose-950/40 cursor-pointer"
          >
            <span>{t('continue')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-full py-4 rounded-xl bg-white/[0.04] border border-white/15 flex items-center justify-center gap-2 text-slate-300 text-sm">
            <Loader2 className="w-4 h-4 text-rose-400 animate-spin" />
            <span>{partnerContinued ? 'กำลังเริ่มฉากถัดไป...' : t('waiting_partner_continue')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
