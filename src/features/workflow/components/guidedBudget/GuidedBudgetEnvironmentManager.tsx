import { useState, useMemo } from 'react';
import { loadGuidedRooms } from '../../storage/guidedRoomsStorage';

interface GuidedBudgetEnvironmentManagerProps {
  environment: string;
  setEnvironment: (env: string) => void;
  customEnvironment: string;
  setCustomEnvironment: (env: string) => void;
  onRefreshRooms: () => void;
}

export function GuidedBudgetEnvironmentManager({
  environment,
  setEnvironment,
  customEnvironment,
  setCustomEnvironment,
  onRefreshRooms,
}: GuidedBudgetEnvironmentManagerProps) {
  const savedRoomNames = useMemo(() => loadGuidedRooms().map((room) => room.name), [environment]); // Depend on environment for refresh

  return (
    <div className="guided-manual-block-card">
      <div>
        <strong>Ambiente atual</strong>
        <small>Os próximos serviços e peças serão lançados neste ambiente.</small>
      </div>
      <div className="guided-manual-grid">
        <label className="technical-edit-field">
          <span>Ambiente cadastrado</span>
          <select value={environment} onChange={(event) => setEnvironment(event.target.value)}>
            {savedRoomNames.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
        <label className="technical-edit-field guided-wide-field">
          <span>Ou digite outro ambiente</span>
          <input value={customEnvironment} placeholder="Ex.: Corredor superior, suíte, área gourmet..." onChange={(event) => setCustomEnvironment(event.target.value)} />
        </label>
      </div>
      <button className="secondary-action inline-action" type="button" onClick={onRefreshRooms}>Atualizar cômodos</button>
    </div>
  );
}
