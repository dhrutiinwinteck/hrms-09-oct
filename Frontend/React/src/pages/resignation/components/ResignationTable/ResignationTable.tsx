import React, { useState, useEffect } from 'react';
import { Calendar, MoreVertical, Check, Minus } from 'lucide-react';
import { Resignation } from '../../types/resignation.types';
import StatusBadge from '../StatusBadge/StatusBadge';
import './ResignationTable.css';

export interface ResignationTableProps {
  data: Resignation[];
  loading: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ResignationTable: React.FC<ResignationTableProps> = ({ data, loading, onView, onEdit: _onEdit, onDelete: _onDelete }) => {
  // ============================================================
  // 1. RANDOM PASTEL COLOR GENERATOR
  // ============================================================
  const generatePastelColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return {
      bg: `hsl(${hue}, 70%, 88%)`, // Light pastel background
      text: `hsl(${hue}, 80%, 25%)`, // Dark contrasting text
    };
  };

  // ============================================================
  // 2. STATE: Color Map (Initialized ONCE on page load)
  // Using useState with a function ensures this runs only once on mount.
  // When you refresh the browser, this runs again and generates NEW colors!
  // ============================================================
  const [colorMap, setColorMap] = useState(() => {
    const map = new Map();
    data.forEach((row) => {
      map.set(row.id, generatePastelColor());
    });
    return map;
  });

  // ============================================================
  // 3. EFFECT: Update Color Map if new rows are added dynamically
  // (Prevents newly added items from breaking the color map)
  // ============================================================
  useEffect(() => {
    setColorMap((prevMap) => {
      const newMap = new Map(prevMap);
      data.forEach((row) => {
        if (!newMap.has(row.id)) {
          newMap.set(row.id, generatePastelColor());
        }
      });
      return newMap;
    });
  }, [data]);

  if (loading) return <div className="loading-placeholder">Loading...</div>;

  return (
    <div className="resignation-container">
      <table className="resignation-table">
        <thead>
          <tr>
            <th className="th-timeline"></th>
            <th>Employee</th>
            <th>Resignation Details</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Approvals</th>
            <th className="th-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            // Timeline logic
            const statusType = row.status.toLowerCase();
            const timelineClass = statusType.includes('pending') ? 'pending' : 
                                  statusType.includes('approved') ? 'approved' : 
                                  statusType.includes('rejected') ? 'rejected' : 'withdrawn';

            // Retrieve pre-assigned colors for this specific row ID
            const { bg, text } = colorMap.get(row.id) || generatePastelColor();

            return (
              <tr key={row.id} className="resignation-row">
                {/* Timeline Column */}
                <td className="td-timeline">
                  <div className={`timeline-dot ${timelineClass}`}></div>
                </td>

                {/* Employee Column */}
                <td className="td-employee">
                  <div className="employee-card">
                    {/* UPDATED: Random pastel colors that change on every refresh */}
                    <div 
                      className="avatar-initials" 
                      style={{ backgroundColor: bg, color: text }}
                    >
                      {row.employee.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="employee-meta">
                      <span className="emp-name">{row.employee.fullName}</span>
                      <span className="emp-role">{row.employee.designation}</span>
                    </div>
                  </div>
                </td>

                {/* Details Column with Calendar Icons */}
                <td className="td-details">
                  <div className="details-flex">
                    <div className="date-group">
                      <Calendar size={18} className="calendar-icon" />
                      <div>
                        <span className="date-value">{row.resignationDate}</span>
                        <span className="date-label">Resignation Date</span>
                      </div>
                    </div>
                    <div className="vertical-divider"></div>
                    <div className="date-group">
                      <Calendar size={18} className="calendar-icon" />
                      <div>
                        <span className="date-value">{row.lastWorkingDate}</span>
                        <span className="date-label">Last Working Date</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Reason Column */}
                <td className="td-reason">
                  <span className="reason-text">{row.reason}</span>
                </td>

                {/* Status Column */}
                <td className="td-status">
                  <StatusBadge status={row.status as any} />
                </td>

                {/* Approvals Stack Column */}
                <td className="td-approvals">
                  <div className="approval-stack">
                    <div className="step-circle approved"><Check size={12} /></div>
                    <div className="step-circle approved"><Check size={12} /></div>
                    <div className="step-circle pending"><Minus size={12} /></div>
                  </div>
                </td>

                {/* Actions Column */}
                <td className="td-actions">
                  <button className="btn-icon-only" onClick={() => onView(row.id)}>
                    <MoreVertical size={20} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ResignationTable;