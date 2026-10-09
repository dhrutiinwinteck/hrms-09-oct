// import {
//   useCallback,
//   useEffect,
//   useState,
// } from 'react';

// import {
//   getPayslips,
// } from '../services/payslipAdmin.service';

// import type {
//   PayslipRecord,
// } from '../types/payslipAdmin.types';

// export const usePayslipAdmin = () => {
//   const [
//     payslips,
//     setPayslips,
//   ] = useState<PayslipRecord[]>([]);

//   const [
//     isLoading,
//     setIsLoading,
//   ] = useState(true);

//   const [
//     error,
//     setError,
//   ] = useState<string | null>(null);

//   const loadPayslips = useCallback(
//     async () => {
//       setIsLoading(true);
//       setError(null);

//       try {
//         const response = await getPayslips();

//         setPayslips(response);
//       } catch (loadError) {
//         setError(
//           loadError instanceof Error
//             ? loadError.message
//             : 'Unable to load payslips.',
//         );
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [],
//   );

//   useEffect(() => {
//     void loadPayslips();
//   }, [loadPayslips]);

//   return {
//     payslips,
//     isLoading,
//     error,
//     reload: loadPayslips,
//   };
// };


import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  getPayslips,
} from '../services/payslipAdmin.service';

import type {
  PayslipRecord,
} from '../types/payslipAdmin.types';

export const usePayslipAdmin = () => {
  const [
    payslips,
    setPayslips,
  ] = useState<PayslipRecord[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const loadPayslips = useCallback(
    async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getPayslips();

        setPayslips(response);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load payslips.',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadPayslips();
  }, [loadPayslips]);

  return {
    payslips,
    isLoading,
    error,
    reload: loadPayslips,
  };
};