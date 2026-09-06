import { useState, useEffect, useCallback, useRef } from 'react';
import { Client, Room } from 'colyseus.js';
import { ClientPrivateState, ClientSharedState } from '@between-us/shared';

const getColyseusUrl = () => {
  if (import.meta.env.VITE_SERVER_URL) {
    const raw = import.meta.env.VITE_SERVER_URL;
    if (raw.startsWith('http://')) return raw.replace('http://', 'ws://');
    if (raw.startsWith('https://')) return raw.replace('https://', 'wss://');
    if (raw.startsWith('ws://') || raw.startsWith('wss://')) return raw;
    return `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${raw}`;
  }
  return window.location.hostname === 'localhost' 
    ? 'ws://localhost:2567' 
    : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
};

const COLYSEUS_URL = getColyseusUrl();

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

      setSharedState({
        roomCode: state.roomCode,
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
    });
  }, []);

  const createRoom = async () => {
    try {
      const activeRoom = await client.create('game_room');
      bindRoom(activeRoom);
      return activeRoom;
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
      throw err;
    }
  };

  const joinRoom = async (roomCode: string) => {
    try {
      // In colyseus, join by room options or id
      const rooms = await client.getAvailableRooms('game_room');
      const target = rooms.find(r => (r.metadata && r.metadata.roomCode === roomCode.toUpperCase()) || r.roomId.toUpperCase().startsWith(roomCode.toUpperCase()));
      
      const reconnectToken = sessionStorage.getItem('between_us_reconnect_token');
      const activeRoom = target 
        ? await client.joinById(target.roomId, { reconnectToken })
        : await client.joinOrCreate('game_room', { roomCode: roomCode.toUpperCase(), reconnectToken });

      bindRoom(activeRoom);
      return activeRoom;
    } catch (err: any) {
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
