import React from 'react';
import { Plus } from 'lucide-react';
import './ShiftPatternsHeader.css';

interface ShiftPatternsHeaderProps {
  onAddNew?: () => void;
}

const ShiftPatternsHeader: React.FC<ShiftPatternsHeaderProps> = ({ onAddNew }) => {
  return (
    <div className="shift-patterns-header">
      <div className="header-left">
        <h1 className="page-title">Shift Patterns</h1>
        <p className="page-subtitle">Create and manage shift patterns for your organization.</p>
      </div>
      <div className="header-right">
        <div className="breadcrumb">
          <span className="crumb">Dashboard</span>
          <span className="separator">&gt;</span>
          <span className="crumb current">Shift Patterns</span>
        </div>
        <button className="btn-primary add-pattern-btn" onClick={onAddNew}>
          <Plus size={18} />
          Add New Pattern
        </button>
      </div>
    </div>
  );
};

export default ShiftPatternsHeader;