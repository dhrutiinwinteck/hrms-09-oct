import {
  Employee,
  EmployeeFormData,
  CreateEmployeeApiRequest,
  EmployeeApiModel,
  DesignationApiModel,
} from '../types/employees.types';

/**
 * Lookup data required to convert backend IDs
 * into human-readable frontend values.
 */
export interface EmployeeMappingContext {
  designationMap: Map<number, string>;

  employeeMap: Map<number, string>;
}

/**
 * Converts a string/number value into a valid number.
 */
const toNumber = (
  value: string | number | undefined,
  fieldName: string
): number => {
  if (
    typeof value === 'number' &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === 'string' &&
    value.trim() !== ''
  ) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  throw new Error(
    `${fieldName} must contain a valid numeric ID.`
  );
};

/**
 * Converts frontend date to ISO format.
 */
const toIsoDate = (
  date: string
): string => {
  if (!date) {
    throw new Error(
      'Joining date is required.'
    );
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    throw new Error(
      'Invalid joining date.'
    );
  }

  return parsedDate.toISOString();
};

/**
 * Normalizes backend employee status.
 */
const normalizeStatus = (
  status?: unknown,
  isRemove?: number
): Employee['status'] => {
  /**
   * Backend employee_detail uses:
   *
   * is_remove = 0 → Active
   * is_remove = 1 → Inactive
   */
  if (isRemove === 1) {
    return 'Inactive';
  }

  const normalized =
    String(
      status ?? 'Active'
    )
      .trim()
      .toLowerCase();

  switch (normalized) {
    case 'inactive':
      return 'Inactive';

    case 'on leave':
      return 'On Leave';

    case 'terminated':
      return 'Terminated';

    case 'active':
    default:
      return 'Active';
  }
};

/**
 * Normalizes employee type.
 */
const normalizeEmployeeType = (
  value?: unknown
): Employee['employeeType'] => {
  const normalized =
    String(
      value ?? 'Full Time'
    ).trim();

  switch (normalized) {
    case 'Part Time':
      return 'Part Time';

    case 'Contract':
      return 'Contract';

    case 'Intern':
      return 'Intern';

    case 'Full Time':
    default:
      return 'Full Time';
  }
};

/**
 * Converts backend date into frontend date format.
 */
const formatDateForFrontend = (
  value?: unknown
): string => {
  if (!value) {
    return '';
  }

  const date =
    new Date(String(value));

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date
    .toISOString()
    .split('T')[0];
};

/**
 * Creates designation lookup map.
 *
 * Example:
 *
 * 1026 → Software Developer
 * 1027 → Project Manager
 */
export const createDesignationMap = (
  designations: DesignationApiModel[]
): Map<number, string> => {
  const map =
    new Map<number, string>();

  for (
    const designation
    of designations
  ) {
    if (
      Number.isFinite(
        designation.id
      ) &&
      designation.name
    ) {
      map.set(
        designation.id,
        designation.name
      );
    }
  }

  return map;
};

/**
 * Creates employee lookup map.
 *
 * Example:
 *
 * 1 → Abhinav Chaudhari
 * 4 → Rahul Sharma
 */
export const createEmployeeMap = (
  employees: EmployeeApiModel[]
): Map<number, string> => {
  const map =
    new Map<number, string>();

  for (
    const employee
    of employees
  ) {
    if (
      employee.id === undefined ||
      employee.id === null
    ) {
      continue;
    }

    const employeeId =
      Number(employee.id);

    if (
      !Number.isFinite(
        employeeId
      )
    ) {
      continue;
    }

    const firstName =
      String(
        employee.first_name ?? ''
      ).trim();

    const lastName =
      String(
        employee.last_name ?? ''
      ).trim();

    const fullName =
      String(
        employee.full_name ??
          `${firstName} ${lastName}`
      ).trim();

    if (fullName) {
      map.set(
        employeeId,
        fullName
      );
    }
  }

  return map;
};

export const employeeMapper = {
  /**
   * Converts existing frontend form
   * into backend POST contract.
   */
  toApiPayload: (
    formData: EmployeeFormData
  ): CreateEmployeeApiRequest => {
    return {
      first_name:
        formData.firstName.trim(),

      last_name:
        formData.lastName.trim(),

      email:
        formData.email
          .trim()
          .toLowerCase(),

      password:
        formData.password,

      designation:
        toNumber(
          formData.designation,
          'Designation'
        ),

      reporting_manager:
        toNumber(
          formData.reportingManager,
          'Reporting manager'
        ),

      phone:
        formData.phone?.trim() || '',

      gender:
        toNumber(
          formData.gender,
          'Gender'
        ),

      doj:
        toIsoDate(
          formData.joiningDate
        ),
    };
  },

  /**
   * Converts backend employee response
   * into frontend Employee model.
   *
   * IMPORTANT:
   *
   * designation ID is converted into
   * designation NAME using designationMap.
   *
   * reporting manager ID is converted
   * into employee NAME using employeeMap.
   */
  fromApiResponse: (
    data: EmployeeApiModel,
    context?: EmployeeMappingContext
  ): Employee => {
    const firstName =
      String(
        data.first_name ?? ''
      );

    const lastName =
      String(
        data.last_name ?? ''
      );

    const fullName =
      String(
        data.full_name ??
          `${firstName} ${lastName}`
      ).trim();

    /**
     * Internal database ID.
     */
    const employeeId =
      String(
        data.id ?? ''
      );

    /**
     * Business employee code.
     *
     * Example:
     *
     * IWT1001
     */
    const employeeCode =
      String(
        data.emp_code ??
          data.employee_code ??
          ''
      );

    // ------------------------------------------------------------
    // DESIGNATION
    // ------------------------------------------------------------

    const designationId =
      Number(
        data.designation
      );

    let designationName =
      '';

    if (
      Number.isFinite(
        designationId
      ) &&
      context?.designationMap
    ) {
      designationName =
        context.designationMap.get(
          designationId
        ) ?? '';
    }

    /**
     * Fallback:
     *
     * If the lookup fails, don't crash.
     * Display the backend value.
     */
    if (!designationName) {
      designationName =
        String(
          data.designation ?? ''
        );
    }

    // ------------------------------------------------------------
    // REPORTING MANAGER
    // ------------------------------------------------------------

    const reportingManagerId =
      Number(
        data.reporting_manager
      );

    let reportingManagerName =
      '';

    if (
      Number.isFinite(
        reportingManagerId
      ) &&
      context?.employeeMap
    ) {
      reportingManagerName =
        context.employeeMap.get(
          reportingManagerId
        ) ?? '';
    }

    /**
     * Fallback if manager lookup
     * cannot be resolved.
     */
    if (!reportingManagerName) {
      reportingManagerName =
        String(
          data.reporting_manager ?? ''
        );
    }

    return {
      id: employeeId,

      employeeCode,

      firstName,

      lastName,

      fullName,

      email:
        String(
          data.email ?? ''
        ),

      personalEmail:
        String(
          data.personal_email ?? ''
        ),

      phone:
        String(
          data.phone ?? ''
        ),

      photo:
        String(
          data.photo ?? ''
        ),

      gender:
        String(
          data.gender ?? ''
        ),

      password: '',

      noticePeriod:
        Number(
          data.notice_period ?? 0
        ),

      joiningDate:
        formatDateForFrontend(
          data.doj ??
            data.joining_date
        ),

      designation:
        designationName,

      department:
        String(
          data.department ?? ''
        ),

      reportingManager:
        reportingManagerName,

      employeeType:
        normalizeEmployeeType(
          data.emp_type ??
            data.employee_type
        ),

      status:
        normalizeStatus(
          data.status,
          data.is_remove
        ),

      createdAt:
        String(
          data.createdon ??
            data.created_at ??
            ''
        ),

      updatedAt:
        String(
          data.modifiedon ??
            data.updated_at ??
            ''
        ),
    };
  },
};