import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { sound } from '../utils/sound';
import { ClientSharedState, ClientPrivateState } from '@between-us/shared';
import { Copy, Check, Users, ShieldAlert, Sparkles } from 'lucide-react';

interface LobbyPageProps {
  shared: ClientSharedState;
  privateState: ClientPrivateState;
  onReady: () => void;
}

export const LobbyPage: React.FC<LobbyPageProps> = ({ shared, privateState, onReady }) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}?join=${shared.roomCode}`;

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isPlayerA = privateState.role === 'playerA';
  const myReady = isPlayerA ? shared.playerAReady : shared.playerBReady;
  const partnerConnected = isPlayerA ? shared.playerBConnected : shared.playerAConnected;
  const partnerReady = isPlayerA ? shared.playerBReady : shared.playerAReady;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 bg-radial-dark text-slate-100 font-thai">
      <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col items-center shadow-2xl relative">
        {/* Room Code Header */}
        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-mono block mb-1">
            {t('room_code')}
          </span>
          <div className="text-4xl font-mono tracking-widest text-white font-bold bg-white/5 py-2 px-6 rounded-xl border border-white/10">
            {shared.roomCode}
          </div>
        </div>

        {/* Share Invite Link */}
        <div className="w-full mb-8">
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 transition-all"
          >
            <span className="truncate max-w-[220px]">{shareUrl}</span>
            <div className="flex items-center gap-1.5 text-rose-400 font-medium">
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('link_copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t('copy_link')}</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Player Status Cards */}
        <div className="w-full flex flex-col gap-3 mb-8">
          {/* My Role */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="text-sm font-medium text-white">
                  {isPlayerA ? t('role_a') : t('role_b')}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">YOU</div>
              </div>
            </div>
            <div className="text-xs font-mono">
              {myReady ? (
                <span className="text-emerald-400 font-medium">{t('ready')}</span>
              ) : (
                <span className="text-slate-400">Not Ready</span>
              )}
            </div>
          </div>

          {/* Partner Role */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
            <div className="flex items-center gap-3">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  partnerConnected ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'
                }`}
              />
              <div>
                <div className="text-sm font-medium text-white">
                  {isPlayerA ? t('role_b') : t('role_a')}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {partnerConnected ? t('partner_connected') : t('waiting_for_partner')}
                </div>
              </div>
            </div>
            <div className="text-xs font-mono">
              {partnerConnected ? (
                partnerReady ? (
                  <span className="text-emerald-400 font-medium">{t('partner_ready')}</span>
                ) : (
                  <span className="text-slate-400">Not Ready</span>
                )
              ) : (
                <span className="text-rose-400/80">...</span>
              )}
            </div>
          </div>
        </div>

        {/* Ready Action Button */}
        <button
          onClick={() => {
            sound.playConfirm();
            onReady();
          }}
          disabled={myReady || !partnerConnected}
          className={`w-full py-4 rounded-xl font-medium tracking-wide transition-all border ${
            myReady
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 cursor-default'
              : !partnerConnected
              ? 'bg-white/5 border-white/10 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white border-white/20 shadow-lg shadow-purple-950/40'
          }`}
        >
          {myReady
            ? t('you_are_ready')
            : !partnerConnected
            ? t('waiting_for_partner')
            : t('ready')}
        </button>
      </div>
    </div>
  );
};
