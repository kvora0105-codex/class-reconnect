import api from './api';

export const discoverGroups = async () => {
  const { data } = await api.get('/groups/discover');
  return data;
};

export const getMyGroups = async () => {
  const { data } = await api.get('/my-groups');
  return data;
};

export const createGroup = async (payload: {
  name: string; description: string; tags: string[];
  studyGoal: string; availability: string; maxMembers: number;
  branch: string; semester: string;
}) => {
  const { data } = await api.post('/groups', payload);
  return data;
};

export const joinGroup = async (groupId: string) => {
  const { data } = await api.post(`/groups/${groupId}/join`);
  return data;
};

export const leaveGroup = async (groupId: string) => {
  const { data } = await api.post(`/groups/${groupId}/leave`);
  return data;
};

export const getGroupMessages = async (groupId: string) => {
  const { data } = await api.get(`/groups/${groupId}/messages`);
  return data;
};

export const sendGroupMessage = async (groupId: string, message: string) => {
  const { data } = await api.post(`/groups/${groupId}/messages`, { message });
  return data;
};
