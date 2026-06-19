import api from './api';

export const loginUser = async (email: string, password: string, role?: string) => {
  const { data } = await api.post('/auth/login', { email, password, role });
  return data;
};

export const registerStudent = async (payload: {
  firstName: string; lastName: string; email: string;
  password: string; branch: string; semester: string;
}) => {
  const { data } = await api.post('/auth/register/student', payload);
  return data;
};

export const registerTeacher = async (payload: {
  firstName: string; lastName: string; email: string; password: string;
  department: string; subject: string; employeeId: string;
  yearsExperience: string; hobby: string;
}) => {
  const { data } = await api.post('/auth/register/teacher', payload);
  return data;
};

export const getProfile = async () => {
  const { data } = await api.get('/auth/profile');
  return data;
};

export const updateProfile = async (payload: Record<string, unknown>) => {
  const { data } = await api.put('/auth/profile', payload);
  return data;
};

export const logoutUser = async () => {
  try { await api.post('/auth/logout'); } catch (_) {}
};
