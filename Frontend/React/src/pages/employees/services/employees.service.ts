import axios, {
  AxiosError,
  AxiosInstance,
} from 'axios';

import {
  Employee,
  EmployeeFormData,
  EmployeeApiModel,
  CreateEmployeeApiRequest,
  EmployeeUpdatePayload,
  EmployeeStatistics,
  // DesignationApiModel,
} from '../types/employees.types';

import {
  employeeMapper,
  createEmployeeMap,
  EmployeeMappingContext,
} from '../utils/employees.mapper';

/**
 * ============================================================
 * API BASE URL
 * ============================================================
 *
 * Example:
 *
 * VITE_API_BASE_URL=http://192.168.1.7:8000
 *
 * Do NOT add /api/v1 here.
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://192.168.1.5:8001';

/**
 * ============================================================
 * Axios Instance
 * ============================================================
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * ============================================================
 * Employee API Endpoints
 * ============================================================
 */
const EMPLOYEE_ENDPOINTS = {
  BASE: '/api/v1/employees/',

  PROFILE: (empCode: string) =>
    `/api/v1/employees/profile/${encodeURIComponent(
      empCode
    )}`,
} as const;

/**
 * ============================================================
 * Designation API Endpoint
 * ============================================================
 *
 * Backend:
 *
 * GET /api/v1/designations/
 *
 * Expected response:
 *
 * [
 *   {
 *     "id": 1026,
 *     "name": "Software Developer"
 *   }
 * ]
 */
// const DESIGNATION_ENDPOINT =
//   '/api/v1/designations/';

/**
 * ============================================================
 * Error Handler
 * ============================================================
 */
const getErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (axios.isAxiosError(error)) {
    const axiosError =
      error as AxiosError<{
        detail?: string;
        message?: string;
      }>;

    const responseData =
      axiosError.response?.data;

    if (
      responseData &&
      typeof responseData === 'object'
    ) {
      if (
        typeof responseData.detail === 'string'
      ) {
        return responseData.detail;
      }

      if (
        typeof responseData.message === 'string'
      ) {
        return responseData.message;
      }
    }

    if (axiosError.message) {
      return axiosError.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

/**
 * ============================================================
 * Extract Employee List
 * ============================================================
 */
const extractList = (
  responseData: unknown
): EmployeeApiModel[] => {
  if (Array.isArray(responseData)) {
    return responseData as EmployeeApiModel[];
  }

  if (
    responseData &&
    typeof responseData === 'object'
  ) {
    const objectData =
      responseData as Record<
        string,
        unknown
      >;

    if (Array.isArray(objectData.data)) {
      return objectData.data as EmployeeApiModel[];
    }

    if (Array.isArray(objectData.items)) {
      return objectData.items as EmployeeApiModel[];
    }

    if (Array.isArray(objectData.results)) {
      return objectData.results as EmployeeApiModel[];
    }

    if (
      objectData.data &&
      typeof objectData.data === 'object'
    ) {
      const nested =
        objectData.data as Record<
          string,
          unknown
        >;

      if (Array.isArray(nested.items)) {
        return nested.items as EmployeeApiModel[];
      }

      if (Array.isArray(nested.results)) {
        return nested.results as EmployeeApiModel[];
      }
    }
  }

  return [];
};

/**
 * ============================================================
 * Extract Single Employee
 * ============================================================
 */
const extractSingleEmployee = (
  responseData: unknown
): EmployeeApiModel => {
  if (
    responseData &&
    typeof responseData === 'object'
  ) {
    const objectData =
      responseData as Record<
        string,
        unknown
      >;

    if (
      objectData.data &&
      typeof objectData.data === 'object'
    ) {
      return objectData.data as EmployeeApiModel;
    }

    if (
      objectData.employee &&
      typeof objectData.employee === 'object'
    ) {
      return objectData.employee as EmployeeApiModel;
    }
  }

  return responseData as EmployeeApiModel;
};

/**
 * ============================================================
 * Extract Designation List
 * ============================================================
 */
// const extractDesignationList = (
//   responseData: unknown
// ): DesignationApiModel[] => {
//   if (Array.isArray(responseData)) {
//     return responseData as DesignationApiModel[];
//   }

//   if (
//     responseData &&
//     typeof responseData === 'object'
//   ) {
//     const objectData =
//       responseData as Record<
//         string,
//         unknown
//       >;

//     if (Array.isArray(objectData.data)) {
//       return objectData.data as DesignationApiModel[];
//     }

//     if (Array.isArray(objectData.items)) {
//       return objectData.items as DesignationApiModel[];
//     }

//     if (Array.isArray(objectData.results)) {
//       return objectData.results as DesignationApiModel[];
//     }

//     if (
//       objectData.data &&
//       typeof objectData.data === 'object'
//     ) {
//       const nested =
//         objectData.data as Record<
//           string,
//           unknown
//         >;

//       if (Array.isArray(nested.items)) {
//         return nested.items as DesignationApiModel[];
//       }

//       if (Array.isArray(nested.results)) {
//         return nested.results as DesignationApiModel[];
//       }
//     }
//   }

//   return [];
// };

/**
 * ============================================================
 * Load Employee Lookup Context
 * ============================================================
 *
 * Creates:
 *
 * designationMap:
 *
 * 1026 -> Software Developer
 * 1027 -> Project Manager
 *
 * employeeMap:
 *
 * 1 -> Abhinav Chaudhari
 * 2 -> Rahul Sharma
 */
// const buildEmployeeMappingContext = async (
//   rawEmployees: EmployeeApiModel[]
// ): Promise<EmployeeMappingContext> => {
//   /**
//    * ----------------------------------------------------------
//    * Employee map
//    * ----------------------------------------------------------
//    *
//    * This map is created directly from the employee
//    * list returned by the backend.
//    */
//   const employeeMap =
//     createEmployeeMap(rawEmployees);

//   /**
//    * ----------------------------------------------------------
//    * Designation API
//    * ----------------------------------------------------------
//    */
//   const designationResponse =
//     await api.get(
//       DESIGNATION_ENDPOINT
//     );

//   const rawDesignations =
//     extractDesignationList(
//       designationResponse.data
//     );

//   const designationMap =
//     createDesignationMap(
//       rawDesignations
//     );

//   return {
//     designationMap,
//     employeeMap,
//   };
// };

/**
 * ============================================================
 * Employee Service
 * ============================================================
 */
export const employeesService = {
  /**
   * ==========================================================
   * GET EMPLOYEES
   * ==========================================================
   *
   * GET /api/v1/employees/
   *
   * This method:
   *
   * 1. Gets employees
    * 2. Creates employee lookup map
 * 3. Converts reporting manager IDs to names
   */
  async getEmployees(params?: {
    page?: number;
    limit?: number;
    search?: string;
    designation?: string;
  }): Promise<{
    data: Employee[];
    total: number;
  }> {
    try {
      /**
       * --------------------------------------------------------
       * STEP 1: Get employees
       * --------------------------------------------------------
       */
      const response =
        await api.get(
          EMPLOYEE_ENDPOINTS.BASE,
          {
            params: {
              ...(params?.page !== undefined && {
                page: params.page,
              }),

              ...(params?.limit !== undefined && {
                limit: params.limit,
              }),

              ...(params?.search && {
                search: params.search,
              }),

              ...(params?.designation && {
                designation:
                  params.designation,
              }),
            },
          }
        );

      const rawEmployees =
        extractList(response.data);

      /**
       * --------------------------------------------------------
       * STEP 2: Build lookup maps
       * --------------------------------------------------------
       */
      const mappingContext: EmployeeMappingContext = {
  designationMap: new Map(),
  employeeMap: createEmployeeMap(rawEmployees),
};

      /**
       * --------------------------------------------------------
       * STEP 3: Map backend → frontend
       * --------------------------------------------------------
       */
      const employees =
        rawEmployees.map(
          (employee) =>
            employeeMapper.fromApiResponse(
              employee,
              mappingContext
            )
        );

      /**
       * --------------------------------------------------------
       * DEBUG
       * --------------------------------------------------------
       *
       * You can remove these after confirming the result.
       */
      console.log(
        'Employee mapping context:',
        mappingContext
      );

      console.log(
        'Mapped employees:',
        employees
      );

      /**
       * --------------------------------------------------------
       * STEP 4: Total
       * --------------------------------------------------------
       */
      const responseObject =
        response.data &&
        typeof response.data === 'object'
          ? (
              response.data as Record<
                string,
                unknown
              >
            )
          : null;

      const totalFromApi =
        responseObject &&
        typeof responseObject.total ===
          'number'
          ? responseObject.total
          : employees.length;

      return {
        data: employees,
        total: totalFromApi,
      };
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          'Failed to fetch employees.'
        )
      );
    }
  },

  /**
   * ==========================================================
   * GET EMPLOYEE PROFILE
   * ==========================================================
   */
  async getEmployeeProfile(
    empCode: string
  ): Promise<Employee> {
    if (!empCode.trim()) {
      throw new Error(
        'Employee code is required.'
      );
    }

    try {
      const response =
        await api.get(
          EMPLOYEE_ENDPOINTS.PROFILE(
            empCode.trim()
          )
        );

      const employee =
        extractSingleEmployee(
          response.data
        );

      /**
       * Profile endpoint already returns
       * designation/reporting manager names.
       *
       * Therefore no lookup context is required.
       */
      return employeeMapper.fromApiResponse(
        employee
      );
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          'Failed to fetch employee profile.'
        )
      );
    }
  },

  /**
   * ==========================================================
   * CREATE EMPLOYEE
   * ==========================================================
   */
  async createEmployee(
    payload: EmployeeFormData
  ): Promise<Employee> {
    const apiPayload: CreateEmployeeApiRequest =
      employeeMapper.toApiPayload(
        payload
      );

    try {
      const response =
        await api.post(
          EMPLOYEE_ENDPOINTS.BASE,
          apiPayload
        );

      const employee =
        extractSingleEmployee(
          response.data
        );

      /**
       * Newly-created employee response
       * can contain designation ID.
       *
       * Fetch designations and employees again
       * so the newly-created employee is mapped
       * consistently.
       */
      return employeeMapper.fromApiResponse(
        employee
      );
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          'Failed to create employee.'
        )
      );
    }
  },

  /**
   * ==========================================================
   * UPDATE EMPLOYEE
   * ==========================================================
   */
  async updateEmployee(
    _id: string,
    _payload: EmployeeUpdatePayload
  ): Promise<Employee> {
    throw new Error(
      'Employee update API endpoint has not been configured yet.'
    );
  },

  /**
   * ==========================================================
   * DELETE EMPLOYEE
   * ==========================================================
   */
  async deleteEmployee(
    _id: string
  ): Promise<void> {
    throw new Error(
      'Employee delete API endpoint has not been configured yet.'
    );
  },

  /**
   * ==========================================================
   * EMPLOYEE STATISTICS
   * ==========================================================
   */
  async getEmployeeStatistics(
    employees: Employee[]
  ): Promise<EmployeeStatistics> {
    const total =
      employees.length;

    const active =
      employees.filter(
        (employee) =>
          employee.status ===
          'Active'
      ).length;

    const currentDate =
      new Date();

    const thirtyDaysAgo =
      new Date(currentDate);

    thirtyDaysAgo.setDate(
      thirtyDaysAgo.getDate() - 30
    );

    const newJoiners =
      employees.filter(
        (employee) => {
          if (
            !employee.joiningDate
          ) {
            return false;
          }

          const joinDate =
            new Date(
              employee.joiningDate
            );

          return (
            joinDate >=
              thirtyDaysAgo &&
            employee.status ===
              'Active'
          );
        }
      ).length;

    const onLeave =
      employees.filter(
        (employee) =>
          employee.status ===
          'On Leave'
      ).length;

    return {
      total,
      active,
      newJoiners,
      onLeave,
    };
  },

  /**
   * ==========================================================
   * REPORTING MANAGERS
   * ==========================================================
   */
  async getReportingManagers(
    employees: Employee[]
  ): Promise<string[]> {
    const managers =
      employees
        .map(
          (employee) =>
            employee.reportingManager
        )
        .filter(Boolean);

    return [
      ...new Set(managers),
    ];
  },
};

export default employeesService;