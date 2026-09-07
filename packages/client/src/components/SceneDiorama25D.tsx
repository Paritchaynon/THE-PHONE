import React, { useState, useEffect, useRef } from 'react';
import { InteractiveHotspot, PlayerRole } from '@between-us/shared';
import { Smartphone, Eye, HeartHandshake, Coffee, AlertCircle, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

interface SceneDiorama25DProps {
  sceneId: string;
  chapter: number;
  bgImage: string;
  role: PlayerRole;
  hotspots?: InteractiveHotspot[];
  onSelectHotspot: (actionChoiceId: string) => void;
  activeAction?: {
    initiatorRole: PlayerRole;
    actionId: string;
    actionLabelTh?: string;
    actionLabelEn?: string;
    timestamp: number;
  };
  hasChosen: boolean;
  locale: 'th' | 'en';
}

export const SceneDiorama25D: React.FC<SceneDiorama25DProps> = ({
  sceneId,
  chapter,
  bgImage,
  role,
  hotspots = [],
  onSelectHotspot,
  activeAction,
  hasChosen,
  locale
}) => {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [hoveredSpot, setHoveredSpot] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax tracker (Mouse or Device Touch)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMouseOffset({ x, y });
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        // Clamp mobile tilt
        const x = Math.min(Math.max(e.gamma / 45, -0.5), 0.5);
        const y = Math.min(Math.max((e.beta - 45) / 45, -0.5), 0.5);
        setMouseOffset({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }
    };
  }, []);

  // Play sound cue when activeAction occurs
  useEffect(() => {
    if (activeAction) {
      if (activeAction.actionId === 'a_peek_phone') {
        sound.playPhoneVibrate();
      } else {
        sound.playAlert();
      }
    }
  }, [activeAction?.timestamp]);

  // Filter hotspots available for this player
  const availableHotspots = hotspots.filter(h => h.targetRole === role && !hasChosen);

  // Calculate 3D Parallax transforms
  const rotateX = -mouseOffset.y * 14;
  const rotateY = mouseOffset.x * 18;
  const bgTranslateX = -mouseOffset.x * 20;
  const bgTranslateY = -mouseOffset.y * 15;
  const tableTranslateX = mouseOffset.x * 15;
  const tableTranslateY = mouseOffset.y * 10;
  const charTranslateX = -mouseOffset.x * 8;

  const renderIcon = (type: InteractiveHotspot['type']) => {
    switch (type) {
      case 'phone':
        return <Smartphone className="w-5 h-5 text-rose-300 animate-pulse" />;
      case 'partner_eyes':
        return <Eye className="w-5 h-5 text-indigo-300" />;
      case 'hands':
        return <HeartHandshake className="w-5 h-5 text-amber-300" />;
      case 'drinks':
        return <Coffee className="w-5 h-5 text-amber-200" />;
      default:
        return <Sparkles className="w-5 h-5 text-teal-300" />;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[52vh] min-h-[360px] max-h-[540px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-sm group select-none"
      style={{
        perspective: '1200px'
      }}
    >
      {/* 2.5D Tilt Container */}
      <div 
        className="w-full h-full relative transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Layer 0: Background Artwork (Deep parallax) */}
        <div 
          className="absolute -inset-10 bg-cover bg-center transition-all duration-300 ease-out brightness-90 filter"
          style={{
            backgroundImage: `url(${bgImage})`,
            transform: `translate3d(${bgTranslateX}px, ${bgTranslateY}px, -100px) scale(1.15)`
          }}
        />

        {/* Cinematic atmospheric overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080a0f] via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-radial-vignette opacity-70 pointer-events-none" />

        {/* Ambient Floating Dust / Light Particles (2.5D Midground) */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
          style={{
            transform: `translate3d(${charTranslateX}px, 0px, 40px)`
          }}
        >
          <div className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-rose-500/20 blur-3xl animate-pulse-slow" />
          <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-indigo-500/15 blur-3xl animate-pulse-slow" />
        </div>

        {/* Foreground 2.5D Interactive Table Surface (Tilted Plane) */}
        <div 
          className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/80 via-slate-900/60 to-transparent pointer-events-none"
          style={{
            transform: `translate3d(${tableTranslateX}px, ${tableTranslateY}px, 60px)`
          }}
        />

        {/* INTERACTIVE HOTSPOTS (Clickable 2.5D Anchors) */}
        {availableHotspots.map((spot) => {
          const isHovered = hoveredSpot === spot.id;
          const zDepth = (spot.position.z || 1) * 40;

          return (
            <div
              key={spot.id}
              className="absolute z-20 transition-all duration-300 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                left: `${spot.position.x}%`,
                top: `${spot.position.y}%`,
                transform: `translate3d(0, 0, ${zDepth}px)`
              }}
              onMouseEnter={() => {
                setHoveredSpot(spot.id);
                sound.playClick();
              }}
              onMouseLeave={() => setHoveredSpot(null)}
              onClick={() => onSelectHotspot(spot.actionChoiceId)}
            >
              {/* Pulsing Beacon Rings */}
              <div className="relative flex items-center justify-center">
                <span className="absolute w-12 h-12 rounded-full bg-rose-500/30 animate-ping pointer-events-none" />
                <span className="absolute w-10 h-10 rounded-full bg-rose-500/40 animate-pulse pointer-events-none" />
                
                {/* Hotspot Action Button */}
                <button 
                  className={`relative p-3.5 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    isHovered 
                      ? 'bg-rose-500/80 border-rose-300 text-white scale-110 shadow-[0_0_25px_rgba(244,63,94,0.6)]' 
                      : 'bg-black/60 border-white/30 text-rose-200 hover:border-rose-400/80'
                  }`}
                >
                  {renderIcon(spot.type)}
                </button>

                {/* Hotspot Floating Tooltip */}
                <div 
                  className={`absolute top-full mt-2.5 px-3 py-1.5 rounded-xl bg-black/85 border border-white/20 text-xs whitespace-nowrap shadow-xl transition-all duration-200 pointer-events-none backdrop-blur-md font-medium text-slate-100 ${
                    isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
                  }`}
                >
                  <span className="text-rose-400 mr-1">✦</span>
                  {locale === 'th' ? spot.nameTh : spot.nameEn}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Reaction Alert Toast (Action-Reaction ping-pong banner) */}
      {activeAction && (
        <div className="absolute top-4 inset-x-4 md:inset-x-8 z-30 animate-fade-in pointer-events-none">
          <div className="bg-rose-950/85 border border-rose-500/40 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-[0_10px_30px_rgba(244,63,94,0.3)] flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 animate-pulse">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-mono uppercase tracking-wider text-rose-400">
                {locale === 'th' ? 'ปฏิกิริยาสดจากอีกฝ่าย' : 'LIVE PARTNER ACTION'}
              </p>
              <p className="text-sm font-thai text-slate-100 font-medium truncate">
                {locale === 'th' ? activeAction.actionLabelTh : activeAction.actionLabelEn}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Hint Badge */}
      <div className="absolute bottom-3 left-4 z-20 pointer-events-none flex items-center gap-2">
        <span className="px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          2.5D PARALLAX DIORAMA
        </span>
        {availableHotspots.length > 0 && (
          <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 backdrop-blur-md border border-rose-500/30 text-[10px] text-rose-300 font-mono animate-pulse">
            {locale === 'th' ? 'แตะสิ่งของในฉากเพื่อโต้ตอบ' : 'Tap items on table to interact'}
          </span>
        )}
      </div>
    </div>
  );
};
