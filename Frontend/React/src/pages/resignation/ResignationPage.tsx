// pages/ResignationPage.tsx
import React, { useState } from "react";
import ResignationTable from "./components/ResignationTable/ResignationTable";
import ResignationForm from "./components/ResignationForm/ResignationForm";
import { Resignation } from "./types/resignation.types";
import { CreateResignationInput } from "./validations/resignation.schema";

// Replace with actual auth user
const CURRENT_USER = {
  id: "emp001",
  fullName: "John Doe",
  designation: "Senior Developer",
  department: "Engineering",
  avatarUrl: "https://i.pravatar.cc/40?img=1",
};

const ResignationPage: React.FC = () => {
  const [resignations, setResignations] = useState<Resignation[]>([
    // Initial data from API or mock
  ]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddResignation = (formData: CreateResignationInput) => {
    setLoading(true);
    // Simulate async submission
    setTimeout(() => {
      const newResignation: Resignation = {
        id: `res-${Date.now()}`,
        employee: {
          id: CURRENT_USER.id,
          fullName: CURRENT_USER.fullName,
          designation: CURRENT_USER.designation,
          department: CURRENT_USER.department,
          avatarUrl: CURRENT_USER.avatarUrl,
        },
        // `resignationDate` does not exist in `CreateResignationInput`, removed.
         resignationDate: new Date().toISOString().split("T")[0], // Default to today
        lastWorkingDate: String(formData.lastWorkingDate), // Fix: convert to string
        reason: formData.reason as any, // Fix: Cast as any to match required `ResignationReason` type
         details: formData.comments || "",
        status: "Pending",
         approvals: [], // New resignations start with an empty approval stack
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setResignations((prev) => [newResignation, ...prev]);
      setShowForm(false);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="resignation-page">
      <div className="page-header">
        <h1>Resignation Management</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          Apply Resignation
        </button>
      </div>

      <ResignationTable
        data={resignations}
        loading={false}
        onView={(id) => console.log("View", id)}
        onEdit={(id) => console.log("Edit", id)}
        onDelete={(id) => console.log("Delete", id)}
      />

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ResignationForm
              onSubmit={handleAddResignation}
              onCancel={() => setShowForm(false)}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResignationPage;
