import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { sound } from '../utils/sound';
import { ClientSharedState, ClientPrivateState } from '@between-us/shared';
import { Eye, ArrowRight, CheckCircle2 } from 'lucide-react';

interface RevealScreenProps {
  shared: ClientSharedState;
  privateState: ClientPrivateState;
  onContinue: () => void;
}

export const RevealScreen: React.FC<RevealScreenProps> = ({ shared, privateState, onContinue }) => {
  const { t, getChoiceText } = useI18n();
  const isPlayerA = privateState.role === 'playerA';

  const myChoiceText = isPlayerA
    ? getChoiceText(shared.revealedChoiceA || '')
    : getChoiceText(shared.revealedChoiceB || '');

  const partnerChoiceText = isPlayerA
    ? getChoiceText(shared.revealedChoiceB || '')
    : getChoiceText(shared.revealedChoiceA || '');

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 md:p-12 bg-radial-dark text-slate-100 font-thai">
      <div className="w-full max-w-xl bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col items-center shadow-2xl relative">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-rose-400 mb-2">
          <Eye className="w-4 h-4" />
          <span>{t('revealed_title')}</span>
        </div>

        <h2 className="text-xl md:text-2xl font-light text-white mb-6 text-center">
          ช่วงเวลาแห่งการเปิดเผย
        </h2>

        {/* Decisions comparison */}
        <div className="w-full flex flex-col gap-4 mb-8">
          {/* My Choice */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
              {t('your_choice')}
            </span>
            <p className="text-sm md:text-base text-white font-light">
              {myChoiceText || '...'}
            </p>
          </div>

          {/* Partner Choice */}
          <div className="p-4 rounded-xl bg-rose-500/[0.04] border border-rose-500/20">
            <span className="text-[11px] font-mono uppercase text-rose-300 block mb-1">
              {t('partner_chose')}
            </span>
            <p className="text-sm md:text-base text-rose-100 font-light">
              {partnerChoiceText || '...'}
            </p>
          </div>
        </div>

        {/* Continue Action */}
        <button
          onClick={() => {
            sound.playClick();
            onContinue();
          }}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-medium tracking-wide flex items-center justify-center gap-2 border border-white/20 transition-all transform hover:-translate-y-0.5"
        >
          <span>{t('continue')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
