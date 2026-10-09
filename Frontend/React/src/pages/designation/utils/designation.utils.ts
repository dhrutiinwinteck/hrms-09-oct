import {
  BarChart3,
  BriefcaseBusiness,
  Code2,
  Landmark,
  UserRound,
} from "lucide-react";
import type { Designation } from "../types/designation.types";

export const getDesignationInitials = (
  designationName: string,
): string => {
  const words = designationName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

export const getDesignationIcon = (
  designation: Designation,
) => {
  const value = designation.name.toLowerCase();

  if (
    value.includes("software") ||
    value.includes("developer") ||
    value.includes("designer")
  ) {
    return Code2;
  }

  if (
    value.includes("finance") ||
    value.includes("account") ||
    value.includes("chief financial")
  ) {
    return Landmark;
  }

  if (
    value.includes("human") ||
    value.includes("hr") ||
    value.includes("recruit")
  ) {
    return UserRound;
  }

  if (
    value.includes("manager") ||
    value.includes("executive")
  ) {
    return BriefcaseBusiness;
  }

  return BarChart3;
};

export const formatEmployeeCount = (
  count: number,
): string => {
  return count.toString().padStart(2, "0");
};