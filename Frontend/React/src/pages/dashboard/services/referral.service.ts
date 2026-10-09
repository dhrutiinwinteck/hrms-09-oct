import axiosInstance from '../../../services/axios/axiosInstance';

export interface ReferralLinkResponse {
  referralToken: string;
  referralUrl: string;
}

export interface ReferralTokenValidationResponse {
  valid: boolean;
}

export const getMyReferralLink =
  async (): Promise<ReferralLinkResponse> => {
    const response =
      await axiosInstance.get<ReferralLinkResponse>(
        '/api/v1/referrals/my-link'
      );

    return response.data;
  };

export const validateReferralToken =
  async (
    token: string
  ): Promise<ReferralTokenValidationResponse> => {
    const response =
      await axiosInstance.get<ReferralTokenValidationResponse>(
        `/api/v1/referrals/validate/${encodeURIComponent(token)}`
      );

    return response.data;
  };