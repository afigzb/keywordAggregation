export interface RootResponse {
  message: string;
}

export interface DataResponse {
  data: number[];
  status: string;
}

const API_BASE_URL = 'http://127.0.0.1:6759';

export const fetchRootMessage = async (): Promise<RootResponse> => {
  const response = await fetch(`${API_BASE_URL}/`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json() as RootResponse;
};

export const fetchDataList = async (): Promise<DataResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/data`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json() as DataResponse;
};
