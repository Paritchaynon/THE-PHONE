import React, { useEffect, useState } from 'react';
import { useColyseus, getHttpServerUrl } from './hooks/useColyseus';
import { LandingPage } from './components/LandingPage';
import { LobbyPage } from './components/LobbyPage';
import { GameScene } from './components/GameScene';
import { RevealScreen } from './components/RevealScreen';
import { ResultPage } from './components/ResultPage';
import { GameResultSummary } from '@between-us/shared';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const {
    connected,
    error,
    sharedState,
    privateState,
    availableChoices,
    createRoom,
    joinRoom,
    sendReady,
    submitChoice,
    continueReveal
  } = useColyseus();

  const [loading, setLoading] = useState(false);
  const [publicResult, setPublicResult] = useState<GameResultSummary | null>(null);

  // Auto-check URL for share code or join room code
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    const resultShareCode = urlParams.get('result');

    if (resultShareCode) {
      // Fetch public result
      fetch(`${getHttpServerUrl()}/api/result/${resultShareCode}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) setPublicResult(data);
        })
        .catch(() => {});
    } else if (joinCode && !connected) {
      joinRoom(joinCode).catch(() => {});
    }
  }, [connected, joinRoom]);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await createRoom();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (code: string) => {
    setLoading(true);
    try {
      await joinRoom(code);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // If viewing public result URL
  if (publicResult) {
    return (
      <ResultPage
        result={publicResult}
        onPlayAgain={() => {
          window.location.href = window.location.origin;
        }}
      />
    );
  }

  // Not connected -> Landing Page
  if (!connected || !sharedState || !privateState) {
    return (
      <LandingPage
        onCreateRoom={handleCreate}
        onJoinRoom={handleJoin}
        loading={loading}
        errorMessage={error}
      />
    );
  }

  // In Lobby
  if (sharedState.status === 'LOBBY') {
    return (
      <LobbyPage
        shared={sharedState}
        privateState={privateState}
        onReady={sendReady}
      />
    );
  }

  // Reveal Phase (Simultaneous Reveal)
  if (sharedState.status === 'REVEAL') {
    return (
      <RevealScreen
        shared={sharedState}
        privateState={privateState}
        onContinue={continueReveal}
      />
    );
  }

  // Game Completed -> Result Page
  if (sharedState.status === 'COMPLETED') {
    if (sharedState.result) {
      return (
        <ResultPage
          result={sharedState.result}
          onPlayAgain={() => {
            window.location.reload();
          }}
        />
      );
    }
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-radial-dark text-white font-thai p-6">
        <Loader2 className="w-8 h-8 text-rose-400 animate-spin mb-4" />
        <p className="text-sm font-light text-slate-300">กำลังประมวลผลความสัมพันธ์...</p>
      </div>
    );
  }

  // Active Game Scene
  if (sharedState.status === 'PLAYING') {
    return (
      <GameScene
        shared={sharedState}
        privateState={privateState}
        availableChoices={availableChoices}
        onSubmitChoice={submitChoice}
      />
    );
  }

  // Fallback to Lobby or Scene
  return (
    <LobbyPage
      shared={sharedState}
      privateState={privateState}
      onReady={sendReady}
    />
  );
};
