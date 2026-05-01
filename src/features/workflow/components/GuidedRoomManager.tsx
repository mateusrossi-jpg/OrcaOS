import { useEffect, useMemo, useState } from 'react';
import {
  createGuidedRoomId,
  guidedRoomTypeLabel,
  loadGuidedRooms,
  saveGuidedRooms,
  setActiveGuidedRoomName,
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
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => saveGuidedRooms(rooms), [rooms]);

  const filteredRooms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return rooms;
    return rooms.filter((room) => [room.name, guidedRoomTypeLabel(room.type), room.notes].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery));
  }, [query, rooms]);

  const selectedRoom = useMemo(() => {
    if (!filteredRooms.length) return null;
    return filteredRooms.find((room) => room.id === selectedRoomId) ?? filteredRooms[0];
  }, [filteredRooms, selectedRoomId]);

  useEffect(() => {
    if (!selectedRoomId && rooms[0]) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

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
    setSelectedRoomId(newRoom.id);
    setActiveGuidedRoomName(name);
    setDraft(emptyRoomDraft);
    setFeedback(`${name} foi adicionado e selecionado como ambiente atual.`);
  }

  function startEditRoom(room: GuidedRoom) {
    setEditingRoomId(room.id);
    setSelectedRoomId(room.id);
    setDraft({ name: room.name, type: room.type, notes: room.notes ?? '' });
    setFeedback(`Editando ${room.name}. Salve para atualizar o ambiente.`);
  }

  function cancelEditRoom() {
    setEditingRoomId(null);
    setDraft(emptyRoomDraft);
    setFeedback(null);
  }

  function saveEditedRoom() {
    if (!editingRoomId) return;

    const name = draft.name.trim();
    if (!name) return;

    const alreadyExists = rooms.some((room) => room.id !== editingRoomId && room.name.trim().toLowerCase() === name.toLowerCase());
    if (alreadyExists) {
      setFeedback('Já existe outro cômodo com esse nome.');
      return;
    }

    setRooms((current) => current.map((room) => {
      if (room.id !== editingRoomId) return room;
      return {
        ...room,
        name,
        type: draft.type,
        notes: draft.notes.trim() || undefined,
        updatedAt: new Date().toISOString(),
      };
    }));

    setSelectedRoomId(editingRoomId);
    setActiveGuidedRoomName(name);
    setEditingRoomId(null);
    setDraft(emptyRoomDraft);
    setFeedback(`${name} foi atualizado e selecionado como ambiente atual.`);
  }

  function duplicateRoom(room: GuidedRoom) {
    const timestamp = new Date().toISOString();
    const copyName = `${room.name} cópia`;
    const copyRoom: GuidedRoom = {
      ...room,
      id: createGuidedRoomId(),
      name: copyName,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setRooms((current) => [...current, copyRoom]);
    setSelectedRoomId(copyRoom.id);
    setActiveGuidedRoomName(copyName);
    setFeedback(`${copyName} foi criado e selecionado como ambiente atual.`);
  }

  function removeRoom(id: string) {
    const removedRoom = rooms.find((room) => room.id === id);
    setRooms((current) => current.filter((room) => room.id !== id));
    if (selectedRoomId === id) setSelectedRoomId('');
    if (editingRoomId === id) cancelEditRoom();
    if (removedRoom) setFeedback(`${removedRoom.name} foi removido da lista.`);
  }

  function useRoomAsCurrent(room: GuidedRoom) {
    setSelectedRoomId(room.id);
    setActiveGuidedRoomName(room.name);
    setFeedback(`${room.name} foi selecionado. O próximo serviço, peça ou kit será lançado nesse ambiente.`);
  }

  return (
    <section className="guided-room-manager">
      <div className="guided-room-header">
        <div>
          <span className="orca-kicker">Ambientes da visita</span>
          <h2>Cômodos e setores</h2>
          <p>Organize a visita por ambiente para lançar serviços, peças, kits e revisar o orçamento por local.</p>
        </div>
        <strong>{rooms.length} ambiente(s)</strong>
      </div>

      <div className="guided-room-card guided-room-edit-card">
        <div className="guided-room-card-title">
          <strong>{editingRoomId ? 'Editar cômodo' : 'Adicionar cômodo'}</strong>
          <small>{editingRoomId ? 'Atualize o nome, tipo ou observação do ambiente selecionado.' : 'Cadastre o ambiente antes de lançar os próximos itens.'}</small>
        </div>

        <div className="guided-room-grid">
          <label>
            <span>Nome do cômodo/setor</span>
            <input value={draft.name} placeholder="Ex.: Quarto 1, Banheiro suíte, Hall..." onChange={(event) => updateDraft('name', event.target.value)} />
          </label>
          <label>
            <span>Tipo</span>
            <select value={draft.type} onChange={(event) => updateDraft('type', event.target.value as GuidedRoomType)}>
              {roomTypeOptions.map((type) => <option key={type} value={type}>{guidedRoomTypeLabel(type)}</option>)}
            </select>
          </label>
          <label className="wide">
            <span>Observação</span>
            <textarea value={draft.notes} placeholder="Ex.: parede de alvenaria, forro de gesso, cliente quer linha preta..." onChange={(event) => updateDraft('notes', event.target.value)} />
          </label>
        </div>

        <div className="guided-room-form-actions">
          <button className="primary-action inline-action" type="button" onClick={editingRoomId ? saveEditedRoom : addRoom}>
            {editingRoomId ? 'Salvar alterações' : 'Adicionar e usar cômodo'}
          </button>
          {editingRoomId && <button className="secondary-action inline-action" type="button" onClick={cancelEditRoom}>Cancelar edição</button>}
        </div>

        {!editingRoomId && <p className="guided-room-helper">Depois de adicionar, o cômodo fica selecionado para os próximos lançamentos do orçamento guiado.</p>}
      </div>

      <div className="guided-room-card guided-room-select-card">
        <div className="guided-room-card-title">
          <strong>Cômodos cadastrados</strong>
          <small>Selecione um ambiente para usar, editar, duplicar ou remover.</small>
        </div>

        <label className="guided-room-search">
          <span>Buscar cômodo</span>
          <input value={query} placeholder="Sala, suíte, banheiro, área externa..." onChange={(event) => setQuery(event.target.value)} />
        </label>

        {filteredRooms.length > 0 ? (
          <>
            <label className="guided-room-search">
              <span>Ambiente selecionado</span>
              <select value={selectedRoom?.id ?? ''} onChange={(event) => setSelectedRoomId(event.target.value)}>
                {filteredRooms.map((room) => <option key={room.id} value={room.id}>{room.name} · {guidedRoomTypeLabel(room.type)}</option>)}
              </select>
            </label>

            {selectedRoom && (
              <article className="guided-room-selected">
                <div>
                  <span>{guidedRoomTypeLabel(selectedRoom.type)}</span>
                  <strong>{selectedRoom.name}</strong>
                  <small>{selectedRoom.notes || 'Sem observação'}</small>
                </div>
                <div className="guided-room-actions">
                  <button className="primary-action inline-action" type="button" onClick={() => useRoomAsCurrent(selectedRoom)}>Usar</button>
                  <button className="secondary-action inline-action" type="button" onClick={() => startEditRoom(selectedRoom)}>Editar</button>
                  <button className="secondary-action inline-action" type="button" onClick={() => duplicateRoom(selectedRoom)}>Duplicar</button>
                  <button className="danger-action" type="button" onClick={() => removeRoom(selectedRoom.id)}>Remover</button>
                </div>
              </article>
            )}
          </>
        ) : (
          <div className="guided-room-empty">Nenhum cômodo encontrado. Adicione um novo ambiente para organizar a visita.</div>
        )}
      </div>

      {feedback && <div className="guided-cart-feedback">{feedback}</div>}
    </section>
  );
}
