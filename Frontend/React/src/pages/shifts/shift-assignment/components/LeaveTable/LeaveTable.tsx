// src/pages/shifts/shift-assignment/components/LeaveTable/LeaveTable.tsx

import React from 'react';
import { CalendarOff, Trash2 } from 'lucide-react';
import { LeaveRecord } from '../../types/shiftAssignment.types';
import './LeaveTable.css';

export interface LeaveTableProps {
    leaves: LeaveRecord[];
    onRemoveLeave: (id: string) => void;
    emptyIcon?: React.ReactNode;
    emptyTitle?: string;
    emptyDescription?: string;
}

const LeaveTable: React.FC<LeaveTableProps> = ({
    leaves,
    onRemoveLeave,
    emptyIcon,
    emptyTitle = 'No leave added',
    emptyDescription = 'Add leave dates to exclude from shift assignment',
}) => {
    if (leaves.length === 0) {
        return (
            <div className="sa-leave-table sa-leave-table--empty">
                <div className="sa-leave-table__empty">
                    {emptyIcon || <CalendarOff size={40} className="sa-leave-table__empty-icon" />}
                    <p className="sa-leave-table__empty-title">{emptyTitle}</p>
                    <p className="sa-leave-table__empty-desc">{emptyDescription}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="sa-leave-table">
            <table className="sa-leave-table__table">
                <thead className="sa-leave-table__head">
                    <tr>
                        <th className="sa-leave-table__th">DATE</th>
                        <th className="sa-leave-table__th">DAY</th>
                        <th className="sa-leave-table__th">LEAVE TYPE</th>
                        <th className="sa-leave-table__th sa-leave-table__th--action">ACTION</th>
                    </tr>
                </thead>
                <tbody className="sa-leave-table__body">
                    {leaves.map((leave) => (
                        <tr key={leave.id} className="sa-leave-table__row">
                            <td className="sa-leave-table__td">{leave.date}</td>
                            <td className="sa-leave-table__td">{leave.dayOfWeek}</td>
                            <td className="sa-leave-table__td">{leave.leaveType}</td>
                            <td className="sa-leave-table__td sa-leave-table__td--action">
                                <button
                                    className="sa-leave-table__delete-btn"
                                    onClick={() => onRemoveLeave(leave.id)}
                                    aria-label="Delete leave"
                                    type="button"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LeaveTable;