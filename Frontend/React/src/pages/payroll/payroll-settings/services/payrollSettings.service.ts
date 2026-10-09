import axiosInstance from '../../../../services/axios/axiosInstance';

import {
  PayrollSettings,
  PayrollSettingsFormData,
} from '../types/payrollSettings.types';


const PAYROLL_SETTINGS_ENDPOINT =
  '/api/v1/payroll/settings';


export const getPayrollSettings =
  async (): Promise<PayrollSettings | null> => {

    const response =
      await axiosInstance.get<PayrollSettings | null>(
        PAYROLL_SETTINGS_ENDPOINT
      );

    return response.data;
  };


const buildFormData = (
  formData: PayrollSettingsFormData
): FormData => {

  const payload = new FormData();

  payload.append(
    'company_name',
    formData.company_name.trim()
  );

  payload.append(
    'company_address',
    formData.company_address.trim()
  );

  payload.append(
    'company_contact',
    formData.company_contact.trim()
  );

  if (formData.company_logo) {
    payload.append(
      'company_logo',
      formData.company_logo
    );
  }

  return payload;
};


export const createPayrollSettings =
  async (
    formData: PayrollSettingsFormData
  ): Promise<PayrollSettings> => {

    const payload = buildFormData(formData);

    const response =
      await axiosInstance.post<PayrollSettings>(
        PAYROLL_SETTINGS_ENDPOINT,
        payload
      );

    return response.data;
  };


export const updatePayrollSettings =
  async (
    settingId: number,
    formData: PayrollSettingsFormData
  ): Promise<PayrollSettings> => {

    const payload = buildFormData(formData);

    const response =
      await axiosInstance.put<PayrollSettings>(
        `${PAYROLL_SETTINGS_ENDPOINT}/${settingId}`,
        payload
      );

    return response.data;
  };