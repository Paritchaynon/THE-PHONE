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

    // Save reconnect info
    activeRoom.onMessage('PRIVATE_SYNC', (data: { private: ClientPrivateState; availableChoiceIds: string[] }) => {
      setPrivateState(data.private);
      setAvailableChoices(data.availableChoiceIds);
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
        state.players.forEach((p: any) => {
          if (p.role === 'playerA') {
            playerAConnected = p.connected;
            playerAReady = p.ready;
            playerAChoiceSubmitted = p.choiceSubmitted;
          } else if (p.role === 'playerB') {
            playerBConnected = p.connected;
            playerBReady = p.ready;
            playerBChoiceSubmitted = p.choiceSubmitted;
          }
        });
      }

      setSharedState({
        roomCode: state.roomCode || activeRoom.id.substring(0, 6).toUpperCase(),
        status: state.status,
        currentSceneId: state.currentSceneId,
        chapter: state.chapter,
        playerAConnected,
        playerBConnected,
        playerAReady,
        playerBReady,
        playerAChoiceSubmitted,
        playerBChoiceSubmitted,
        lastResolvedSceneId: state.lastResolvedSceneId,
        revealedChoiceA: state.revealedChoiceA,
        revealedChoiceB: state.revealedChoiceB
      });
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
      const activeRoom = await client.create('game_room');
      console.log('Room created successfully:', activeRoom.id);
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

      // Query available rooms filtered by roomCode or roomId
      const rooms = await client.getAvailableRooms('game_room');
      console.log('Available rooms on server:', rooms);

      const target = rooms.find(
        (r) =>
          (r.metadata && r.metadata.roomCode === formattedCode) ||
          r.roomId.toUpperCase().startsWith(formattedCode) ||
          r.roomId.toUpperCase() === formattedCode
      );

      const reconnectToken = sessionStorage.getItem('between_us_reconnect_token');
      let activeRoom: Room;

      if (target) {
        console.log('Found existing room:', target.roomId);
        activeRoom = await client.joinById(target.roomId, { reconnectToken, roomCode: formattedCode });
      } else {
        console.log('No existing room matched metadata, joining with joinOrCreate by roomCode...');
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
    createRoom,
    joinRoom,
    sendReady,
    submitChoice,
    continueReveal
  };
}
