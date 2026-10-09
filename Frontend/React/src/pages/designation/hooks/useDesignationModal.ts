import { useState } from "react";

import type {
  Designation,
} from "../types/designation.types";

export type DesignationModalMode =
  | "add"
  | "edit";

export const useDesignationModal = () => {
  const [
    isModalOpen,
    setIsModalOpen,
  ] = useState<boolean>(false);

  const [
    isEditMode,
    setIsEditMode,
  ] = useState<boolean>(false);

  const [
    selectedDesignation,
    setSelectedDesignation,
  ] = useState<Designation | null>(null);

  const openCreateModal = (): void => {
    setIsEditMode(false);
    setSelectedDesignation(null);
    setIsModalOpen(true);
  };

  const openEditModal = (
    designation: Designation,
  ): void => {
    setIsEditMode(true);
    setSelectedDesignation(designation);
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    setSelectedDesignation(null);
    setIsEditMode(false);
  };

  return {
    isModalOpen,
    isEditMode,
    selectedDesignation,
    openCreateModal,
    openEditModal,
    closeModal,
  };
};

export default useDesignationModal;