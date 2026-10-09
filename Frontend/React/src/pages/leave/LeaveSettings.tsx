import React, { useEffect, useState } from "react";
import { Save, Settings2 } from "lucide-react";
import leaveService from "./services/leave.service";
import type { LeaveSettingUpdateRequest } from "./types/leave.types";
import "./LeaveSettings.css";

const OPTIONS = [
  { value: 1, label: "Monthly" },
  { value: 3, label: "Quarter" },
  { value: 6, label: "Half Yearly" },
  { value: 12, label: "Yearly" },
];

const LeaveSettings: React.FC = () => {
  const [leaveType, setLeaveType] = useState(12);
  const [leaveNumber, setLeaveNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await leaveService.getLeaveSettings();
        setLeaveType(data.leave_type);
        setLeaveNumber(data.leave_number);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load leave settings.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const save = async () => {
    if (leaveNumber < 0 || !Number.isFinite(leaveNumber)) {
      setError("Number of leave cannot be negative.");
      return;
    }
    const request: LeaveSettingUpdateRequest = { leave_type: leaveType, leave_number: leaveNumber };
    try {
      setSaving(true);
      setError("");
      await leaveService.updateLeaveSettings(request);
      setMessage("Leave settings updated successfully.");
      window.setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update leave settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="leave-settings-page">
      <div className="leave-settings-container">
        <div className="leave-settings-card">
          <div className="leave-settings-card__header">
            <div className="leave-settings-card__icon"><Settings2 size={20} /></div>
            <div>
              <h1>Leave Settings</h1>
              <p>Configure the leave rule used by the HRMS application.</p>
            </div>
          </div>

          {loading ? <div className="leave-settings-message">Loading settings...</div> : (
            <div className="leave-settings-form">
              <div className="leave-settings-field">
                <label htmlFor="leaveType">Leave Rule</label>
                <select id="leaveType" value={leaveType} onChange={(e) => setLeaveType(Number(e.target.value))} disabled={saving}>
                  {OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>

              <div className="leave-settings-field">
                <label htmlFor="leaveNumber">Number of Leave</label>
                <input id="leaveNumber" type="number" min="0" value={leaveNumber} onChange={(e) => setLeaveNumber(Number(e.target.value))} disabled={saving} />
              </div>

              {error && <div className="leave-settings-error" role="alert">{error}</div>}
              {message && <div className="leave-settings-success" role="status">{message}</div>}

              <button type="button" className="leave-settings-save" onClick={() => void save()} disabled={saving}>
                <Save size={17} />
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default LeaveSettings;
