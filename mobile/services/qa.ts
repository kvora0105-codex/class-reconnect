import api from './api';

export const askQuestion = async (question: string) => {
  const { data } = await api.post('/qa/answer', { question });
  return data;
};

export const getConversations = async () => {
  const { data } = await api.get('/conversations');
  return data;
};

export const createConversation = async (title: string, messages: unknown[]) => {
  const { data } = await api.post('/conversations', { title, messages });
  return data;
};

export const updateConversation = async (
  id: string, title: string, messages: unknown[]
) => {
  const { data } = await api.put(`/conversations/${id}`, { title, messages });
  return data;
};

export const deleteConversation = async (id: string) => {
  const { data } = await api.delete(`/conversations/${id}`);
  return data;
};

export const getPredefinedQuestions = async () => {
  const { data } = await api.get('/predefined/questions');
  return data;
};
