import { useState, useEffect, useCallback, useRef } from 'react';
import { Client, Room } from 'colyseus.js';
import { ClientPrivateState, ClientSharedState } from '@between-us/shared';

export const getColyseusUrl = () => {
  if (import.meta.env.VITE_SERVER_URL) {
    let raw = import.meta.env.VITE_SERVER_URL.trim();
    // If Render passes only the service slug/name without domain (e.g. between-us-server-79k6)
    if (!raw.includes('.') && !raw.includes('localhost') && !raw.includes(':')) {
      raw = `${raw}.onrender.com`;
    }
    if (raw.startsWith('http://')) return raw.replace('http://', 'ws://');
    if (raw.startsWith('https://')) return raw.replace('https://', 'wss://');
    if (raw.startsWith('ws://') || raw.startsWith('wss://')) return raw;
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    return `${isHttps ? 'wss:' : 'ws:'}//${raw}`;
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') {
      return 'ws://localhost:2567';
    }
    return `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
  }
  return 'ws://localhost:2567';
};

export const getHttpServerUrl = () => {
  if (import.meta.env.VITE_SERVER_URL) {
    let raw = import.meta.env.VITE_SERVER_URL.trim();
    if (!raw.includes('.') && !raw.includes('localhost') && !raw.includes(':')) {
      raw = `${raw}.onrender.com`;
    }
    if (raw.startsWith('ws://')) return raw.replace('ws://', 'http://');
    if (raw.startsWith('wss://')) return raw.replace('wss://', 'https://');
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    return `${isHttps ? 'https:' : 'http:'}//${raw}`;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return window.location.origin;
  }
  return 'http://localhost:2567';
};

export const COLYSEUS_URL = getColyseusUrl();

export function useColyseus() {
  const [client] = useState(() => new Client(COLYSEUS_URL));
  const [room, setRoom] = useState<Room | null>(null);
  const [sharedState, setSharedState] = useState<ClientSharedState | null>(null);
  const [privateState, setPrivateState] = useState<ClientPrivateState | null>(null);
  const [availableChoices, setAvailableChoices] = useState<string[]>([]);
  const [availableHotspots, setAvailableHotspots] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roomRef = useRef<Room | null>(null);
  roomRef.current = room;

  const bindRoom = useCallback((activeRoom: Room) => {
    setRoom(activeRoom);
    setConnected(true);
    setError(null);

    // Initial state setup if state already exists
    if (activeRoom.state) {
      setSharedState({
        roomCode: activeRoom.state.roomCode || activeRoom.id.substring(0, 6).toUpperCase(),
        status: activeRoom.state.status || 'LOBBY',
        currentSceneId: activeRoom.state.currentSceneId || 'ch1_intro',
        chapter: activeRoom.state.chapter || 1,
        playerAConnected: true,
        playerBConnected: false,
        playerAReady: false,
        playerBReady: false,
        playerAChoiceSubmitted: false,
        playerBChoiceSubmitted: false,
        lastResolvedSceneId: activeRoom.state.lastResolvedSceneId || '',
        revealedChoiceA: activeRoom.state.revealedChoiceA || '',
        revealedChoiceB: activeRoom.state.revealedChoiceB || ''
      });
    }

    // Authoritative Shared State broadcast directly from server
    activeRoom.onMessage('SHARED_SYNC', (shared: ClientSharedState) => {
      console.log('[Colyseus SHARED_SYNC]', shared);
      setSharedState(shared);
    });

    // Save reconnect info
    activeRoom.onMessage('PRIVATE_SYNC', (data: { private: ClientPrivateState; availableChoiceIds: string[]; availableHotspots?: any[] }) => {
      setPrivateState(data.private);
      setAvailableChoices(data.availableChoiceIds);
      if (data.availableHotspots) {
        setAvailableHotspots(data.availableHotspots);
      } else {
        setAvailableHotspots([]);
      }
      if (data.private.reconnectToken) {
        sessionStorage.setItem('between_us_reconnect_token', data.private.reconnectToken);
        sessionStorage.setItem('between_us_room_id', activeRoom.id);
      }
    });

    activeRoom.onStateChange((state: any) => {
      let playerAConnected = false;
      let playerBConnected = false;
      let playerAReady = false;
      let playerBReady = false;
      let playerAChoiceSubmitted = false;
      let playerBChoiceSubmitted = false;

      if (state.players) {
        const checkPlayer = (p: any) => {
          if (!p) return;
          if (p.role === 'playerA') {
            playerAConnected = Boolean(p.connected);
            playerAReady = Boolean(p.ready);
            playerAChoiceSubmitted = Boolean(p.choiceSubmitted);
          } else if (p.role === 'playerB') {
            playerBConnected = Boolean(p.connected);
            playerBReady = Boolean(p.ready);
            playerBChoiceSubmitted = Boolean(p.choiceSubmitted);
          }
        };

        if (typeof state.players.forEach === 'function') {
          state.players.forEach((p: any) => checkPlayer(p));
        } else if (typeof state.players.values === 'function') {
          for (const p of state.players.values()) checkPlayer(p);
        } else if (typeof state.players === 'object') {
          Object.values(state.players).forEach((p: any) => checkPlayer(p));
        }
      }

      console.log(`[Colyseus StateChange] Players: A(${playerAConnected}, ready=${playerAReady}), B(${playerBConnected}, ready=${playerBReady}), Status: ${state.status}`);

      setSharedState((prev) => ({
        roomCode: state.roomCode || prev?.roomCode || activeRoom.id.substring(0, 6).toUpperCase(),
        status: state.status || prev?.status || 'LOBBY',
        currentSceneId: state.currentSceneId || prev?.currentSceneId || 'ch1_intro',
        chapter: state.chapter || prev?.chapter || 1,
        playerAConnected: playerAConnected || Boolean(prev?.playerAConnected),
        playerBConnected: playerBConnected || Boolean(prev?.playerBConnected),
        playerAReady: playerAReady || Boolean(prev?.playerAReady),
        playerBReady: playerBReady || Boolean(prev?.playerBReady),
        playerAChoiceSubmitted: playerAChoiceSubmitted || Boolean(prev?.playerAChoiceSubmitted),
        playerBChoiceSubmitted: playerBChoiceSubmitted || Boolean(prev?.playerBChoiceSubmitted),
        lastResolvedSceneId: state.lastResolvedSceneId ?? prev?.lastResolvedSceneId,
        revealedChoiceA: state.revealedChoiceA ?? prev?.revealedChoiceA,
        revealedChoiceB: state.revealedChoiceB ?? prev?.revealedChoiceB,
        result: prev?.result
      }));
    });

    activeRoom.onLeave((code) => {
      setConnected(false);
      console.log(`Left room with code: ${code}`);
    });

    activeRoom.onError((code, message) => {
      setError(message || `Room error: ${code}`);
      console.error(`Colyseus room error: ${code}`, message);
    });
  }, []);

  const createRoom = async () => {
    try {
      console.log('Connecting to Colyseus at:', COLYSEUS_URL);
      // Generate a clean 6-character uppercase room code
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let generatedCode = '';
      for (let i = 0; i < 6; i++) {
        generatedCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const activeRoom = await client.create('game_room', { roomCode: generatedCode });
      console.log('Room created successfully:', activeRoom.id, 'with code:', generatedCode);
      bindRoom(activeRoom);
      return activeRoom;
    } catch (err: any) {
      console.error('Error in createRoom:', err);
      setError(err.message || 'Failed to create room');
      throw err;
    }
  };

  const joinRoom = async (roomCode: string) => {
    try {
      const formattedCode = roomCode.trim().toUpperCase();
      console.log('Attempting to join room with code:', formattedCode);

      const reconnectToken = sessionStorage.getItem('between_us_reconnect_token');

      // 1. Try finding existing room from available rooms
      let targetRoomId: string | null = null;
      try {
        const rooms = await client.getAvailableRooms('game_room');
        console.log('Available rooms on server:', rooms);

        const target = rooms.find(
          (r) =>
            (r.metadata && r.metadata.roomCode === formattedCode) ||
            r.roomId.toUpperCase().startsWith(formattedCode) ||
            r.roomId.toUpperCase() === formattedCode
        );
        if (target) {
          targetRoomId = target.roomId;
        }
      } catch (searchErr) {
        console.warn('Could not query getAvailableRooms, falling back to direct join', searchErr);
      }

      let activeRoom: Room;
      if (targetRoomId) {
        console.log('Found existing room by ID:', targetRoomId);
        activeRoom = await client.joinById(targetRoomId, { reconnectToken, roomCode: formattedCode });
      } else {
        console.log('Joining room by roomCode:', formattedCode);
        // Using joinOrCreate with roomCode which matches Colyseus filterBy(['roomCode'])
        activeRoom = await client.joinOrCreate('game_room', { roomCode: formattedCode, reconnectToken });
      }

      console.log('Joined room successfully:', activeRoom.id);
      bindRoom(activeRoom);
      return activeRoom;
    } catch (err: any) {
      console.error('Error in joinRoom:', err);
      setError(err.message || 'Failed to join room');
      throw err;
    }
  };

  const sendReady = () => {
    if (roomRef.current) {
      roomRef.current.send('READY');
    }
  };

  const submitChoice = (choiceId: string) => {
    if (roomRef.current) {
      roomRef.current.send('SUBMIT_CHOICE', { choiceId });
    }
  };

  const continueReveal = () => {
    if (roomRef.current) {
      roomRef.current.send('CONTINUE_REVEAL');
    }
  };

  return {
    client,
    room,
    connected,
    error,
    sharedState,
    privateState,
    availableChoices,
    availableHotspots,
    createRoom,
    joinRoom,
    sendReady,
    submitChoice,
    continueReveal
  };
}
