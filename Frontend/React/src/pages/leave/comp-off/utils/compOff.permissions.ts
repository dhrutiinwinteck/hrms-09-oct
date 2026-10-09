export const HR_DEPARTMENT_NAME =
  'Human Resource';

export const isHumanResourceDepartment = (
  department: string | null | undefined,
): boolean => {
  if (!department) {
    return false;
  }

  return (
    department.trim().toLowerCase() ===
    HR_DEPARTMENT_NAME.toLowerCase()
  );
};