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

export function loadGuidedRooms(): GuidedRoom[] {
  if (typeof window === 'undefined') return starterRooms;
  return safeParseRooms(window.localStorage.getItem(STORAGE_KEY));
}

export function saveGuidedRooms(rooms: GuidedRoom[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
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
