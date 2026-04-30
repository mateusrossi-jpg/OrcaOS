export type GuidedRoomType =
  | 'sala'
  | 'quarto'
  | 'cozinha'
  | 'banheiro'
  | 'area-externa'
  | 'garagem'
  | 'escritorio'
  | 'comercial'
  | 'outro';

export interface GuidedRoom {
  id: string;
  name: string;
  type: GuidedRoomType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'orcaos:guided-rooms:v1';
const ACTIVE_ROOM_KEY = 'orcaos:guided-active-room:v1';
export const GUIDED_ACTIVE_ROOM_EVENT = 'orcaos:guided-active-room-changed';

const now = () => new Date().toISOString();

const starterRooms: GuidedRoom[] = [
  { id: 'room-sala', name: 'Sala', type: 'sala', createdAt: now(), updatedAt: now() },
  { id: 'room-cozinha', name: 'Cozinha', type: 'cozinha', createdAt: now(), updatedAt: now() },
  { id: 'room-quarto', name: 'Quarto', type: 'quarto', createdAt: now(), updatedAt: now() },
  { id: 'room-banheiro', name: 'Banheiro', type: 'banheiro', createdAt: now(), updatedAt: now() },
  { id: 'room-area-externa', name: 'Área externa', type: 'area-externa', createdAt: now(), updatedAt: now() },
  { id: 'room-garagem', name: 'Garagem', type: 'garagem', createdAt: now(), updatedAt: now() },
  { id: 'room-escritorio', name: 'Escritório', type: 'escritorio', createdAt: now(), updatedAt: now() },
];

function safeParseRooms(value: string | null): GuidedRoom[] {
  if (!value) return starterRooms;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return starterRooms;
    return parsed.filter((room): room is GuidedRoom => {
      if (!room || typeof room !== 'object') return false;
      const maybeRoom = room as Partial<GuidedRoom>;
      return typeof maybeRoom.id === 'string' && typeof maybeRoom.name === 'string' && typeof maybeRoom.type === 'string';
    });
  } catch {
    return starterRooms;
  }
}

function dispatchActiveRoomEvent(roomName: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(GUIDED_ACTIVE_ROOM_EVENT, { detail: { roomName } }));
}

export function loadGuidedRooms(): GuidedRoom[] {
  if (typeof window === 'undefined') return starterRooms;
  return safeParseRooms(window.localStorage.getItem(STORAGE_KEY));
}

export function saveGuidedRooms(rooms: GuidedRoom[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
}

export function loadActiveGuidedRoomName(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(ACTIVE_ROOM_KEY) ?? '';
}

export function setActiveGuidedRoomName(roomName: string): void {
  if (typeof window === 'undefined') return;
  const normalizedRoomName = roomName.trim();
  if (!normalizedRoomName) return;

  window.localStorage.setItem(ACTIVE_ROOM_KEY, normalizedRoomName);

  const rooms = safeParseRooms(window.localStorage.getItem(STORAGE_KEY));
  const prioritizedRooms = prioritizeGuidedRoom(rooms, normalizedRoomName);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prioritizedRooms));

  dispatchActiveRoomEvent(normalizedRoomName);
}

export function prioritizeGuidedRoom(rooms: GuidedRoom[], roomName: string): GuidedRoom[] {
  const normalizedRoomName = roomName.trim().toLowerCase();
  if (!normalizedRoomName) return rooms;
  const selectedRoom = rooms.find((room) => room.name.trim().toLowerCase() === normalizedRoomName);
  if (!selectedRoom) return rooms;
  return [selectedRoom, ...rooms.filter((room) => room.id !== selectedRoom.id)];
}

export function createGuidedRoomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `room-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

export function guidedRoomTypeLabel(type: GuidedRoomType): string {
  const labels: Record<GuidedRoomType, string> = {
    sala: 'Sala',
    quarto: 'Quarto',
    cozinha: 'Cozinha',
    banheiro: 'Banheiro',
    'area-externa': 'Área externa',
    garagem: 'Garagem',
    escritorio: 'Escritório',
    comercial: 'Comercial',
    outro: 'Outro',
  };
  return labels[type];
}
