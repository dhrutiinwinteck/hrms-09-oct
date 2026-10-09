/**
 * Axios Instance Configuration
 */

import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
} from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8000';

const axiosInstance: AxiosInstance =
  axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
  });

/* ============================================================
   REQUEST INTERCEPTOR
============================================================ */

axiosInstance.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem(
        'accessToken'
      );

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    /*
     * Axios/browser must generate the correct
     * multipart boundary for FormData.
     *
     * For normal JSON requests we allow Axios
     * to determine the appropriate content type.
     */

    if (
      typeof FormData !== 'undefined' &&
      config.data instanceof FormData
    ) {

      delete config.headers['Content-Type'];

    } else if (
      config.data !== undefined &&
      config.data !== null
    ) {

      config.headers['Content-Type'] =
        'application/json';
    }

    return config;
  },

  (error: AxiosError) =>
    Promise.reject(error)
);

/* ============================================================
   RESPONSE INTERCEPTOR
============================================================ */

axiosInstance.interceptors.response.use(  

  (response: AxiosResponse) =>
    response,

  (error: AxiosError) => {

    console.error(
      'API Error:',
      error.message
    );

    return Promise.reject(error);
  }
);

export default axiosInstance;