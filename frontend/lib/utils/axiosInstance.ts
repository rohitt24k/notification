// axiosInstance.ts
import axios, { AxiosResponse, AxiosError } from "axios";

interface CustomErrorResponse {
  error: string;
}

interface CustomAxiosError extends AxiosError {
  response: AxiosResponse<CustomErrorResponse>;
}

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL + "/api",
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  (error: CustomAxiosError): Promise<CustomAxiosError> => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
