import axiosInstance from '../../../services/axios/axiosInstance';

/* ============================================================
   EMPLOYEE ID STORAGE KEYS
============================================================ */

const EMPLOYEE_ID_KEYS = [
  'employeeId',
  'employee_id',
  'currentEmployeeId',
  'current_employee_id',
  'userEmployeeId',
  'user_employee_id',
] as const;


/* ============================================================
   AUTHENTICATION TOKEN KEYS
============================================================ */

const TOKEN_KEYS = [
  'token',
  'accessToken',
] as const;


/* ============================================================
   USERNAME / EMPLOYEE CODE STORAGE KEYS
============================================================ */

const USERNAME_KEYS = [
  'username',
  'userName',
  'user_name',
  'empCode',
  'emp_code',
  'employeeCode',
  'employee_code',
] as const;


/* ============================================================
   PARSE POSITIVE INTEGER
============================================================ */

const parsePositiveInteger = (
  value: unknown,
): number | null => {

  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }


  if (
    typeof value === 'number'
  ) {

    return Number.isInteger(value) &&
      value > 0
      ? value
      : null;
  }


  if (
    typeof value !== 'string'
  ) {
    return null;
  }


  const normalizedValue =
    value.trim();


  if (
    normalizedValue.length === 0
  ) {
    return null;
  }


  const parsed =
    Number.parseInt(
      normalizedValue,
      10,
    );


  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    return null;
  }


  return parsed;
};


/* ============================================================
   GET AUTHENTICATION TOKEN
============================================================ */

const getAuthenticationToken =
  (): string | null => {

    for (
      const key of TOKEN_KEYS
    ) {

      const token =
        localStorage.getItem(
          key,
        );


      if (
        token &&
        token.trim()
      ) {

        return token.trim();
      }
    }


    return null;
  };


/* ============================================================
   GET USERNAME / EMPLOYEE CODE FROM STORAGE
============================================================ */

const getStoredEmployeeCode =
  (): string | null => {

    for (
      const key of USERNAME_KEYS
    ) {

      const value =
        localStorage.getItem(
          key,
        );


      if (
        value &&
        value.trim()
      ) {

        return value.trim();
      }
    }


    return null;
  };


/* ============================================================
   GET USERNAME / EMPLOYEE CODE FROM JWT
============================================================ */

const getEmployeeCodeFromToken =
  (): string | null => {

    const token =
      getAuthenticationToken();


    if (!token) {
      return null;
    }


    try {

      const parts =
        token.split('.');


      if (
        parts.length !== 3
      ) {
        return null;
      }


      const base64Url =
        parts[1];


      if (!base64Url) {
        return null;
      }


      let base64 =
        base64Url
          .replace(/-/g, '+')
          .replace(/_/g, '/');


      const remainder =
        base64.length % 4;


      if (
        remainder !== 0
      ) {

        base64 += '='.repeat(
          4 - remainder,
        );
      }


      const decoded =
        window.atob(
          base64,
        );


      const payload =
        JSON.parse(
          decoded,
        ) as Record<
          string,
          unknown
        >;


      /*
       * Most likely username / employee-code
       * claims.
       */

      const possibleKeys = [
        'username',
        'user_name',
        'userName',
        'emp_code',
        'empCode',
        'employee_code',
        'employeeCode',
        'sub',
      ];


      for (
        const key of possibleKeys
      ) {

        const value =
          payload[key];


        if (
          typeof value === 'string' &&
          value.trim()
        ) {

          return value.trim();
        }
      }

    } catch (
      error: unknown
    ) {

      console.error(
        'Unable to read employee code from JWT.',
        error,
      );
    }


    return null;
  };


/* ============================================================
   GET EMPLOYEE ID DIRECTLY FROM LOCAL STORAGE
============================================================ */

const getStoredEmployeeId =
  (): number | null => {

    for (
      const key of EMPLOYEE_ID_KEYS
    ) {

      const employeeId =
        parsePositiveInteger(
          localStorage.getItem(
            key,
          ),
        );


      if (
        employeeId !== null
      ) {

        return employeeId;
      }
    }


    return null;
  };


/* ============================================================
   GET EMPLOYEE ID FROM JWT
============================================================ */

const getEmployeeIdFromToken =
  (): number | null => {

    const token =
      getAuthenticationToken();


    if (!token) {
      return null;
    }


    try {

      const parts =
        token.split('.');


      if (
        parts.length !== 3
      ) {
        return null;
      }


      const base64Url =
        parts[1];


      if (!base64Url) {
        return null;
      }


      let base64 =
        base64Url
          .replace(/-/g, '+')
          .replace(/_/g, '/');


      const remainder =
        base64.length % 4;


      if (
        remainder !== 0
      ) {

        base64 += '='.repeat(
          4 - remainder,
        );
      }


      const decoded =
        window.atob(
          base64,
        );


      const payload =
        JSON.parse(
          decoded,
        ) as Record<
          string,
          unknown
        >;


      const possibleKeys = [
        'employee_id',
        'employeeId',
        'employeeID',
        'emp_id',
        'empId',
      ];


      for (
        const key of possibleKeys
      ) {

        const employeeId =
          parsePositiveInteger(
            payload[key],
          );


        if (
          employeeId !== null
        ) {

          return employeeId;
        }
      }

    } catch (
      error: unknown
    ) {

      console.error(
        'Unable to read employee ID from JWT.',
        error,
      );
    }


    return null;
  };


/* ============================================================
   EMPLOYEE API RECORD
============================================================ */

interface EmployeeApiRecord {
  id?: unknown;
  employeeId?: unknown;
  employee_id?: unknown;
  empId?: unknown;
  emp_id?: unknown;

  empCode?: unknown;
  emp_code?: unknown;
  employeeCode?: unknown;
  employee_code?: unknown;

  username?: unknown;

  [key: string]: unknown;
}


/* ============================================================
   API RESPONSE
============================================================ */

interface EmployeeListApiResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
  employees?: unknown;
}


/* ============================================================
   EXTRACT EMPLOYEE ARRAY
============================================================ */

const extractEmployees =
  (
    responseData: unknown,
  ): EmployeeApiRecord[] => {

    if (
      Array.isArray(responseData)
    ) {

      return responseData.filter(
        (
          item,
        ): item is EmployeeApiRecord =>
          typeof item === 'object' &&
          item !== null,
      );
    }


    if (
      typeof responseData !== 'object' ||
      responseData === null
    ) {

      return [];
    }


    const response =
      responseData as EmployeeListApiResponse;


    if (
      Array.isArray(
        response.data,
      )
    ) {

      return response.data.filter(
        (
          item,
        ): item is EmployeeApiRecord =>
          typeof item === 'object' &&
          item !== null,
      );
    }


    if (
      typeof response.data === 'object' &&
      response.data !== null
    ) {

      const nestedData =
        response.data as {
          employees?: unknown;
          data?: unknown;
        };


      if (
        Array.isArray(
          nestedData.employees,
        )
      ) {

        return nestedData.employees.filter(
          (
            item,
          ): item is EmployeeApiRecord =>
            typeof item === 'object' &&
            item !== null,
        );
      }


      if (
        Array.isArray(
          nestedData.data,
        )
      ) {

        return nestedData.data.filter(
          (
            item,
          ): item is EmployeeApiRecord =>
            typeof item === 'object' &&
            item !== null,
        );
      }
    }


    if (
      Array.isArray(
        response.employees,
      )
    ) {

      return response.employees.filter(
        (
          item,
        ): item is EmployeeApiRecord =>
          typeof item === 'object' &&
          item !== null,
      );
    }


    return [];
  };


/* ============================================================
   GET EMPLOYEE RECORD ID
============================================================ */

const getEmployeeRecordId =
  (
    employee: EmployeeApiRecord,
  ): number | null => {

    const possibleIdFields = [
      employee.id,
      employee.employeeId,
      employee.employee_id,
      employee.empId,
      employee.emp_id,
    ];


    for (
      const value of possibleIdFields
    ) {

      const employeeId =
        parsePositiveInteger(
          value,
        );


      if (
        employeeId !== null
      ) {

        return employeeId;
      }
    }


    return null;
  };


/* ============================================================
   GET EMPLOYEE CODE
============================================================ */

const getEmployeeCode =
  (
    employee: EmployeeApiRecord,
  ): string | null => {

    const possibleCodeFields = [
      employee.empCode,
      employee.emp_code,
      employee.employeeCode,
      employee.employee_code,
      employee.username,
    ];


    for (
      const value of possibleCodeFields
    ) {

      if (
        typeof value === 'string' &&
        value.trim()
      ) {

        return value.trim();
      }
    }


    return null;
  };


/* ============================================================
   FIND EMPLOYEE ID BY EMPLOYEE CODE
============================================================ */

const findEmployeeIdByCode =
  async (
    employeeCode: string,
  ): Promise<number | null> => {

    const normalizedEmployeeCode =
      employeeCode.trim().toLocaleLowerCase();


    if (
      normalizedEmployeeCode.length === 0
    ) {

      return null;
    }


    console.log(
      'Policy module: resolving employee ID from employee code:',
      employeeCode,
    );


    /*
     * IMPORTANT:
     *
     * We intentionally use the existing
     * GET /api/v1/employees/ endpoint.
     *
     * We DO NOT call:
     *
     * /employees/profile/{emp_code}
     *
     * because that endpoint is returning 422
     * for IWT90.
     */

    const response =
      await axiosInstance.get(
        '/api/v1/employees/',
      );


    const employees =
      extractEmployees(
        response.data,
      );


    console.log(
      'Policy module: employees received:',
      employees.length,
    );


    for (
      const employee of employees
    ) {

      const code =
        getEmployeeCode(
          employee,
        );


      if (!code) {
        continue;
      }


      if (
        code.trim().toLocaleLowerCase() ===
        normalizedEmployeeCode
      ) {

        const employeeId =
          getEmployeeRecordId(
            employee,
          );


        if (
          employeeId !== null
        ) {

          console.log(
            'Policy module: employee found.',
            {
              employeeCode: code,
              employeeId,
            },
          );


          return employeeId;
        }
      }
    }


    return null;
  };


/* ============================================================
   GET CURRENT EMPLOYEE ID
============================================================ */

/**
 * Resolves the current employee ID without modifying
 * the Employee backend.
 *
 * Resolution order:
 *
 * 1. Existing employeeId in localStorage
 * 2. employee ID inside JWT
 * 3. Employee code from localStorage
 * 4. Employee code from JWT
 * 5. GET /api/v1/employees/
 * 6. Find matching emp_code
 */
export const getCurrentEmployeeId =
  async (): Promise<number> => {

    /* --------------------------------------------------------
       STEP 1
       Existing employee ID
    -------------------------------------------------------- */

    const storedEmployeeId =
      getStoredEmployeeId();


    if (
      storedEmployeeId !== null
    ) {

      console.log(
        'Policy module: employee ID found in localStorage:',
        storedEmployeeId,
      );


      return storedEmployeeId;
    }


    /* --------------------------------------------------------
       STEP 2
       Employee ID inside JWT
    -------------------------------------------------------- */

    const tokenEmployeeId =
      getEmployeeIdFromToken();


    if (
      tokenEmployeeId !== null
    ) {

      console.log(
        'Policy module: employee ID found in JWT:',
        tokenEmployeeId,
      );


      return tokenEmployeeId;
    }


    /* --------------------------------------------------------
       STEP 3
       Employee code from localStorage
    -------------------------------------------------------- */

    let employeeCode =
      getStoredEmployeeCode();


    /* --------------------------------------------------------
       STEP 4
       Employee code from JWT
    -------------------------------------------------------- */

    if (
      !employeeCode
    ) {

      employeeCode =
        getEmployeeCodeFromToken();
    }


    if (
      !employeeCode
    ) {

      throw new Error(
        'Employee code was not found for the logged-in user.',
      );
    }


    console.log(
      'Policy module: logged-in employee code:',
      employeeCode,
    );


    /* --------------------------------------------------------
       STEP 5
       Resolve ID using employees list
    -------------------------------------------------------- */

    const employeeId =
      await findEmployeeIdByCode(
        employeeCode,
      );


    if (
      employeeId === null
    ) {

      throw new Error(
        `Employee ID could not be found for employee code "${employeeCode}".`,
      );
    }


    /* --------------------------------------------------------
       STEP 6
       Cache ID for future Policy page requests
    -------------------------------------------------------- */

    localStorage.setItem(
      'employeeId',
      String(employeeId),
    );


    console.log(
      'Policy module: employee ID resolved and cached:',
      employeeId,
    );


    return employeeId;
  };