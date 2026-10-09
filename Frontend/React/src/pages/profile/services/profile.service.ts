// import { PROFILE_DATA } from "../constants/profileConstants.ts";
// import type { ProfileData } from "../types/profile.types.ts";

// export const getProfile = async (): Promise<ProfileData> => {
//   return Promise.resolve(PROFILE_DATA);
// };

import type {
  EmployeeBankApi,
  EmployeeEducationApi,
  EmployeeEmergencyContactApi,
  EmployeeExperienceApi,
  EmployeePersonalDetailsApi,
  EmployeeFamilyInfoApi,
  EmployeeSalaryApi,
  EmployeeBankUpdate,
  EmployeeSalaryUpdate,
} from "../types/profile.types";



const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL as string | undefined
)?.replace(/\/+$/, "");

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

const API_PREFIX = `${API_BASE_URL}/api/v1`;

const getRequestHeaders = (): HeadersInit => {
  const token = localStorage.getItem("accessToken");

  return {
    Accept: "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

const getJson = async <T>(
  endpoint: string,
): Promise<T> => {
  const response = await fetch(
    `${API_PREFIX}${endpoint}`,
    {
      method: "GET",
      headers: getRequestHeaders(),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `GET ${endpoint} failed with status ${response.status}. ${
        errorText || response.statusText
      }`,
    );
  }

  return (await response.json()) as T;
};

const putJson = async <TRequest, TResponse>(
  endpoint: string,
  payload: TRequest,
): Promise<TResponse> => {
  const response = await fetch(
    `${API_PREFIX}${endpoint}`,
    {
      method: "PUT",
      headers: {
        ...getRequestHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `PUT ${endpoint} failed with status ${response.status}. ${
        errorText || response.statusText
      }`,
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
};

export const getEmployeePersonalDetails =
  async (
    empId: number,
  ): Promise<EmployeePersonalDetailsApi> => {
    return getJson<EmployeePersonalDetailsApi>(
      `/personal-details/${empId}`,
    );
  };

export const getEmployeeEducation =
  async (
    empId: number,
  ): Promise<EmployeeEducationApi[]> => {
    return getJson<EmployeeEducationApi[]>(
      `/education-info/employee/${empId}`,
    );
  };

export const getEmployeeBank =
  async (
    empId: number,
  ): Promise<EmployeeBankApi | EmployeeBankApi[]> => {
    return getJson<
      EmployeeBankApi | EmployeeBankApi[]
    >(`/employee-bank/employee/${empId}`);
  };

export const getEmployeeEmergencyContacts =
  async (
    empId: number,
  ): Promise<EmployeeEmergencyContactApi[]> => {
    return getJson<EmployeeEmergencyContactApi[]>(
      `/employee-emergencycontact/employee/${empId}`,
    );
  };

export const getEmployeeExperience =
  async (
    empId: number,
  ): Promise<EmployeeExperienceApi> => {
    return getJson<EmployeeExperienceApi>(
      `/employee-experience/${empId}`,
    );
  };

export const getEmployeeFamilyInfo = async (
  empId: number,
): Promise<EmployeeFamilyInfoApi[]> => {
  return getJson<EmployeeFamilyInfoApi[]>(
    `/employee-familyinfo/employee/${empId}`,
  );
};

// =================================
// GET EMPLOYEE SALARY
// =================================

export const getEmployeeSalary = async (
  empId: number,
): Promise<EmployeeSalaryApi | EmployeeSalaryApi[]> => {
  return getJson<EmployeeSalaryApi | EmployeeSalaryApi[]>(
    `/employee-salary/employee/${empId}`,
  );
};

export const updateEmployeeBank = async (
  bankId: number,
  payload: EmployeeBankUpdate,
): Promise<EmployeeBankApi> => {
  return putJson<EmployeeBankUpdate, EmployeeBankApi>(
    `/employee-bank/${bankId}`,
    payload,
  );
};

export const updateEmployeeSalary = async (
  salaryId: number,
  payload: EmployeeSalaryUpdate,
): Promise<EmployeeSalaryApi> => {
  return putJson<EmployeeSalaryUpdate, EmployeeSalaryApi>(
    `/employee-salary/${salaryId}`,
    payload,
  );
};