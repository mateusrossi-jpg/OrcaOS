import { useEffect, useMemo, useState } from 'react';
import {
  createGuidedRoomId,
  guidedRoomTypeLabel,
  loadGuidedRooms,
  saveGuidedRooms,
  type GuidedRoom,
  type GuidedRoomType,
} from '../storage/guidedRoomsStorage';
import './GuidedRoomManager.css';

const roomTypeOptions: GuidedRoomType[] = ['sala', 'quarto', 'cozinha', 'banheiro', 'area-externa', 'garagem', 'escritorio', 'comercial', 'outro'];

interface RoomDraft {
  name: string;
  type: GuidedRoomType;
  notes: string;
}

const emptyRoomDraft: RoomDraft = {
  name: '',
  type: 'outro',
  notes: '',
};

export function GuidedRoomManager() {
  const [rooms, setRooms] = useState<GuidedRoom[]>(() => loadGuidedRooms());
  const [draft, setDraft] = useState<RoomDraft>(emptyRoomDraft);
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => saveGuidedRooms(rooms), [rooms]);

  const filteredRooms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return rooms;
    return rooms.filter((room) => [room.name, guidedRoomTypeLabel(room.type), room.notes].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery));
  }, [query, rooms]);

  function updateDraft<K extends keyof RoomDraft>(key: K, value: RoomDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function addRoom() {
    const name = draft.name.trim();
    if (!name) return;

    const alreadyExists = rooms.some((room) => room.name.trim().toLowerCase() === name.toLowerCase());
    if (alreadyExists) {
      setFeedback('Esse cômodo já existe na lista.');
      return;
    }

    const timestamp = new Date().toISOString();
    const newRoom: GuidedRoom = {
      id: createGuidedRoomId(),
      name,
      type: draft.type,
      notes: draft.notes.trim() || undefined,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setRooms((current) => [...current, newRoom]);
    setDraft(emptyRoomDraft);
    setFeedback(`${name} foi adicionado à lista de cômodos.`);
  }

  function duplicateRoom(room: GuidedRoom) {
    const timestamp = new Date().toISOString();
    const copyName = `${room.name} cópia`;
    setRooms((current) => [
      ...current,
      {
        ...room,
        id: createGuidedRoomId(),
        name: copyName,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ]);
    setFeedback(`${copyName} foi criado.`);
  }

  function removeRoom(id: string) {
    setRooms((current) => current.filter((room) => room.id !== id));
  }

  function useRoomAsCurrent(room: GuidedRoom) {
    setDraft((current) => ({ ...current, name: room.name, type: room.type, notes: room.notes ?? '' }));
    setFeedback(`${room.name} foi carregado no campo de novo cômodo. Na próxima etapa ele será usado diretamente no seletor do orçamento guiado.`);
  }

  return (
    <section className="guided-room-manager">
      <div className="guided-room-header">
        <div>
          <span className="orca-kicker">Ambientes da visita</span>
          <h2>Cômodos e setores</h2>
          <p>Cadastre cômodos/ambientes para organizar serviços, peças, kits e orçamento por local.</p>
        </div>
        <strong>{rooms.length} ambiente(s)</strong>
      </div>

      <div className="guided-room-card">
        <div>
          <strong>Adicionar cômodo</strong>
          <small>Use este cadastro como lista de ambientes do orçamento guiado.</small>
        </div>
        <div className="guided-room-grid">
          <label>
            <span>Nome do cômodo/setor</span>
            <input value={draft.name} placeholder="Ex.: Suíte casal, Cozinha gourmet, Escritório 2..." onChange={(event) => updateDraft('name', event.target.value)} />
          </label>
          <label>
            <span>Tipo</span>
            <select value={draft.type} onChange={(event) => updateDraft('type', event.target.value as GuidedRoomType)}>
              {roomTypeOptions.map((type) => <option key={type} value={type}>{guidedRoomTypeLabel(type)}</option>)}
            </select>
          </label>
          <label className="wide">
            <span>Observação</span>
            <textarea value={draft.notes} placeholder="Ex.: parede de alvenaria, forro de gesso, área úmida, cliente quer linha preta..." onChange={(event) => updateDraft('notes', event.target.value)} />
          </label>
        </div>
        <button className="primary-action inline-action" type="button" onClick={addRoom}>Adicionar cômodo</button>
      </div>

      <div className="guided-room-card">
        <div>
          <strong>Cômodos cadastrados</strong>
          <small>Lista de ambientes para organizar o levantamento. Use nomes específicos quando houver mais de um quarto/banheiro.</small>
        </div>
        <label className="guided-room-search">
          <span>Buscar cômodo</span>
          <input value={query} placeholder="Sala, suíte, banheiro, área externa..." onChange={(event) => setQuery(event.target.value)} />
        </label>
        <div className="guided-room-list">
          {filteredRooms.map((room) => (
            <article className="guided-room-item" key={room.id}>
              <div>
                <span>{guidedRoomTypeLabel(room.type)}</span>
                <strong>{room.name}</strong>
                <small>{room.notes || 'Sem observação'}</small>
              </div>
              <div className="guided-room-actions">
                <button className="secondary-action inline-action" type="button" onClick={() => useRoomAsCurrent(room)}>Usar</button>
                <button className="secondary-action inline-action" type="button" onClick={() => duplicateRoom(room)}>Duplicar</button>
                <button className="danger-action" type="button" onClick={() => removeRoom(room.id)}>Remover</button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {feedback && <div className="guided-cart-feedback">{feedback}</div>}
    </section>
  );
}
