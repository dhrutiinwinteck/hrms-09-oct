import {
  JoiningApproval,
} from '../types/joiningApprovals.types';

import {
  DESIGNATIONS,
  LOCATIONS,
} from '../constants/joiningApprovals.constants';

/* ============================================================
   MOCK DATA
============================================================ */

const firstNames: string[] = [
  'Rahul',
  'Priya',
  'Amit',
  'Sneha',
  'Vikram',
  'Ananya',
  'Rohit',
  'Kavya',
  'Arjun',
  'Meera',
];

const lastNames: string[] = [
  'Sharma',
  'Verma',
  'Patel',
  'Iyer',
  'Singh',
  'Reddy',
  'Kumar',
  'Nair',
  'Joshi',
  'Gupta',
];

/* ============================================================
   MOCK DATA GENERATOR
============================================================ */

const generateMockData = (
  count: number
): JoiningApproval[] => {
  const data: JoiningApproval[] = [];

  const now = new Date();

  for (let i = 0; i < count; i += 1) {
    /* --------------------------------------------------------
       Candidate Details
    -------------------------------------------------------- */

    const firstName =
      firstNames[i % firstNames.length];

    const lastName =
      lastNames[i % lastNames.length];

    const name =
      `${firstName} ${lastName}`;

    const email =
      `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`;

    /* --------------------------------------------------------
       Designation & Location
    -------------------------------------------------------- */

    const designation =
      DESIGNATIONS[
        i % DESIGNATIONS.length
      ];

    const location =
      LOCATIONS[
        i % LOCATIONS.length
      ];

    /* --------------------------------------------------------
       Joining Date
    -------------------------------------------------------- */

    const joiningDate =
      new Date(now);

    joiningDate.setDate(
      now.getDate() + 10 + i
    );

    /* --------------------------------------------------------
       Applied Date
    -------------------------------------------------------- */

    const appliedDate =
      new Date(now);

    appliedDate.setDate(
      now.getDate() - 5 + i
    );

    /* --------------------------------------------------------
       Add Mock Record
    -------------------------------------------------------- */

    data.push({
      id: `mock-${i + 1}`,

      candidateName: name,

      email,

      phoneNumber:
        `987654${String(i).padStart(4, '0')}`,

      alternatePhoneNumber: null,

      designation,

      department: 'IT',

      location,

      joiningDate:
        joiningDate
          .toISOString()
          .split('T')[0],

      appliedOn:
        appliedDate.toLocaleDateString(
          'en-GB',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }
        ),

      /* ------------------------------------------------------
         Resume Details
      ------------------------------------------------------ */

      resumeOriginalName:
        `${name.replace(
          ' ',
          '_'
        )}_Resume.pdf`,

      resumeStoredName:
        `mock-resume-${i + 1}.pdf`,

      resumePath:
        `/uploads/resumes/mock-resume-${i + 1}.pdf`,

      /* ------------------------------------------------------
         Approval Details
      ------------------------------------------------------ */

      status: 'Pending',

      remark: '',

      referredBy: null,

      reportingManagerStatus: null,

      reportingManagerRemark: null,

      teamManagerStatus: null,

      teamManagerRemark: null,

      hrStatus: null,

      hrRemark: null,
    });
  }

  return data;
};

/* ============================================================
   EXPORT MOCK DATA
============================================================ */

export const mockJoiningApprovals: JoiningApproval[] =
  generateMockData(30);