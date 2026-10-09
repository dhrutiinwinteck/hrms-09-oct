// src/pages/attendance/shift-swap/components/ShiftSwapHeader/ShiftSwapHeader.tsx

import { Plus } from 'lucide-react';

import './ShiftSwapHeader.css';

interface ShiftSwapHeaderProps {
  onRequestShiftChange: () => void;
}

const ShiftSwapHeader = ({
  onRequestShiftChange,
}: ShiftSwapHeaderProps) => {
  return (
    <header className="shift-swap-header">
      <div className="shift-swap-header__content">
        <h1 className="shift-swap-header__title">
          Shift Swap Requests
        </h1>

        <p className="shift-swap-header__description">
          View and manage all employee shift swap requests.
        </p>
      </div>

      <button
        type="button"
        className="shift-swap-header__button"
        onClick={onRequestShiftChange}
      >
        <Plus size={16} strokeWidth={2.5} />

        <span>Request Shift Change</span>
      </button>
    </header>
  );
};

export default ShiftSwapHeader;