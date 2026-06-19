import api from './api';

export const getQuizzes = async (params?: {
  subject?: string; branch?: string; semester?: string;
}) => {
  const { data } = await api.get('/quizzes', { params });
  return data;
};

export const createQuiz = async (payload: {
  name: string; duration: number; branch: string;
  semester: string; subject: string; numQuestions: number;
  questions: { question: string; options: string[]; correct: number }[];
}) => {
  const { data } = await api.post('/quizzes', payload);
  return data;
};

export const submitQuiz = async (quizId: string, payload: {
  score: number;
  totalQuestions: number;
  percentage: number;
  marks: number;
  totalMarks: number;
  answers: {
    questionIndex: number;
    question: string;
    userAnswer: number;
    correctAnswer: number;
    userOptionText: string;
    correctOptionText: string;
    isCorrect: boolean;
  }[];
  userName: string;
  branch?: string;
  semester?: string;
}) => {
  const { data } = await api.post(`/quizzes/${quizId}/results`, payload);
  return data;
};

export const getQuizResults = async (params?: { quizId?: string }) => {
  const endpoint = params?.quizId
    ? `/quizzes/${params.quizId}/results`
    : '/quizzes/results/me';
  const { data } = await api.get(endpoint);
  return data;
};

export const deleteQuiz = async (quizId: string) => {
  const { data } = await api.delete(`/quizzes/${quizId}`);
  return data;
};
