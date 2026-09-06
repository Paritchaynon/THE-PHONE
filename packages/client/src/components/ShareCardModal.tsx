import React, { useRef } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { sound } from '../utils/sound';
import { GameResultSummary } from '@between-us/shared';
import { X, Download, Share2 } from 'lucide-react';

interface ShareCardModalProps {
  result: GameResultSummary;
  onClose: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({ result, onClose }) => {
  const { t, getArchetype, getDynamic, getEnding, locale } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const dynamicInfo = getDynamic(result.coupleDynamic);
  const archAInfo = getArchetype(result.archetypeA);
  const archBInfo = getArchetype(result.archetypeB);
  const endingInfo = getEnding(result.ending);

  const handleDownload = () => {
    sound.playConfirm();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw high quality card onto canvas
    canvas.width = 1080;
    canvas.height = 1350;

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 1350);
    grad.addColorStop(0, '#0f1420');
    grad.addColorStop(0.5, '#1a1829');
    grad.addColorStop(1, '#0b0c12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1350);

    // Decorative glow
    const radial = ctx.createRadialGradient(540, 450, 50, 540, 450, 500);
    radial.addColorStop(0, 'rgba(224, 108, 117, 0.15)');
    radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 1080, 1350);

    // Border line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, 980, 1250);

    // Header Title
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = '300 42px "Inter", "Kanit", sans-serif';
    ctx.letterSpacing = '12px';
    ctx.fillText('BETWEEN US', 540, 160);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '300 20px "Kanit", "Inter", sans-serif';
    ctx.fillText('RELATIONSHIP ARCHETYPE & DYNAMIC', 540, 205);

    // Dynamic Title (Big centerpiece)
    ctx.fillStyle = '#e06c75';
    ctx.font = '600 58px "Inter", "Kanit", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText(dynamicInfo.name, 540, 380);

    // Dynamic Quote
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = '300 26px "Kanit", "Inter", sans-serif';
    ctx.fillText(`“${dynamicInfo.quote}”`, 540, 445);

    // Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(240, 530);
    ctx.lineTo(840, 530);
    ctx.stroke();

    // Two Archetypes
    ctx.textAlign = 'left';
    // Player A
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '300 20px "Kanit", sans-serif';
    ctx.fillText(locale === 'th' ? 'ผู้เล่น A' : 'PLAYER A', 140, 620);
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 36px "Inter", "Kanit", sans-serif';
    ctx.fillText(archAInfo.name, 140, 670);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '300 22px "Kanit", sans-serif';
    ctx.fillText(archAInfo.subtitle, 140, 715);

    // Player B
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '300 20px "Kanit", sans-serif';
    ctx.fillText(locale === 'th' ? 'ผู้เล่น B' : 'PLAYER B', 600, 620);
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 36px "Inter", "Kanit", sans-serif';
    ctx.fillText(archBInfo.name, 600, 670);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '300 22px "Kanit", sans-serif';
    ctx.fillText(archBInfo.subtitle, 600, 715);

    // Ending Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fillRect(140, 800, 800, 160);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(140, 800, 800, 160);

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '300 18px "Kanit", sans-serif';
    ctx.fillText(locale === 'th' ? 'บทสรุปความสัมพันธ์' : 'FINAL ENDING', 540, 850);
    ctx.fillStyle = '#e5c07b';
    ctx.font = '600 38px "Inter", "Kanit", sans-serif';
    ctx.fillText(endingInfo.title, 540, 905);

    // Footer share code
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '400 18px monospace';
    ctx.fillText(`SHARE CODE: ${result.shareCode} // BETWEEN-US.GAME`, 540, 1200);

    // Trigger download
    const link = document.createElement('a');
    link.download = `BetweenUs_${result.shareCode}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-thai">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-white/15 rounded-2xl p-6 shadow-2xl flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-light tracking-wide text-white mb-6">
          {t('share_card')}
        </h3>

        {/* Visual Preview */}
        <div className="w-full aspect-[4/5] max-w-sm rounded-xl p-6 bg-gradient-to-b from-[#1a1829] to-[#0b0c12] border border-white/10 flex flex-col justify-between items-center text-center shadow-inner mb-6">
          <div className="text-[11px] font-mono tracking-widest text-slate-400">
            BETWEEN US
          </div>

          <div className="my-auto">
            <span className="text-[10px] font-mono uppercase text-rose-400 tracking-widest block mb-1">
              COUPLE DYNAMIC
            </span>
            <div className="text-xl md:text-2xl font-bold text-white mb-2">
              {dynamicInfo.name}
            </div>
            <p className="text-xs text-slate-300 font-light italic">
              “{dynamicInfo.quote}”
            </p>
          </div>

          <div className="w-full pt-4 border-t border-white/10 flex justify-between text-xs text-slate-400">
            <span>Ending: {endingInfo.title}</span>
            <span className="font-mono">{result.shareCode}</span>
          </div>
        </div>

        {/* Hidden Canvas for High-Res PNG generation */}
        <canvas ref={canvasRef} className="hidden" />

        <button
          onClick={handleDownload}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-950/40"
        >
          <Download className="w-4 h-4" />
          <span>{t('download_card')}</span>
        </button>
      </div>
    </div>
  );
};
