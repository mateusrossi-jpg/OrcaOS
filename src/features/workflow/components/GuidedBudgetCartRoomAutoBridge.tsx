import { useEffect, useRef } from 'react';
import type { CalculationCapture } from '../../../core/types/workflow';
import { GUIDED_ACTIVE_ROOM_EVENT } from '../storage/guidedRoomsStorage';
import { GuidedBudgetCart as GuidedBudgetCartRoomsConnected } from './GuidedBudgetCartRoomsConnected';

type GuidedCartMode = 'catalog' | 'manual' | 'parts' | 'all';

interface GuidedBudgetCartRoomAutoBridgeProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
  mode?: GuidedCartMode;
}

function findButtonByText(root: HTMLElement, text: string): HTMLButtonElement | null {
  const buttons = Array.from(root.querySelectorAll('button'));
  return buttons.find((button) => button.textContent?.trim().includes(text)) ?? null;
}

function selectRoomInGuidedBudget(root: HTMLElement, roomName: string): void {
  const select = root.querySelector('.guided-cart-panel select') as HTMLSelectElement | null;
  if (!select) return;

  const optionExists = Array.from(select.options).some((option) => option.value === roomName);
  if (!optionExists) return;

  select.value = roomName;
  select.dispatchEvent(new Event('change', { bubbles: true }));
}

export function GuidedBudgetCartRoomAutoBridge({ onSendToBudget, mode = 'all' }: GuidedBudgetCartRoomAutoBridgeProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleActiveRoom(event: Event) {
      const customEvent = event as CustomEvent<{ roomName?: string }>;
      const roomName = customEvent.detail?.roomName?.trim();
      const root = rootRef.current;
      if (!roomName || !root) return;

      const refreshButton = findButtonByText(root, 'Atualizar cômodos');
      refreshButton?.click();

      window.setTimeout(() => selectRoomInGuidedBudget(root, roomName), 50);
      window.setTimeout(() => selectRoomInGuidedBudget(root, roomName), 140);
    }

    window.addEventListener(GUIDED_ACTIVE_ROOM_EVENT, handleActiveRoom);
    return () => window.removeEventListener(GUIDED_ACTIVE_ROOM_EVENT, handleActiveRoom);
  }, []);

  return (
    <div ref={rootRef}>
      <GuidedBudgetCartRoomsConnected onSendToBudget={onSendToBudget} mode={mode} />
    </div>
  );
}
