import api from './api';

export const getResources = async (params?: {
  subject?: string; branch?: string; semester?: string;
}) => {
  const { data } = await api.get('/resources', { params });
  return data;
};

export const uploadResource = async (formData: FormData) => {
  const { data } = await api.post('/resources/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteResource = async (id: string) => {
  const { data } = await api.delete(`/resources/${id}`);
  return data;
};
