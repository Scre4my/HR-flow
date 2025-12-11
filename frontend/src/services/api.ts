import axios from 'axios';
import type { Survey, SurveyResponse, SurveyStatistics } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const surveyService = {
  getAll: async (): Promise<Survey[]> => {
    const response = await api.get('/surveys');
    return response.data;
  },

  getActive: async (): Promise<Survey[]> => {
    const response = await api.get('/surveys/active');
    return response.data;
  },

  getById: async (id: number): Promise<Survey> => {
    const response = await api.get(`/surveys/${id}`);
    return response.data;
  },

  create: async (survey: Partial<Survey>): Promise<Survey> => {
    const response = await api.post('/surveys', survey);
    return response.data;
  },

  update: async (id: number, survey: Partial<Survey>): Promise<Survey> => {
    const response = await api.put(`/surveys/${id}`, survey);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/surveys/${id}`);
  },

  toggle: async (id: number): Promise<Survey> => {
    const response = await api.post(`/surveys/${id}/toggle`);
    return response.data;
  },
};

export const responseService = {
  submit: async (surveyId: number, answers: SurveyResponse['answers']): Promise<{ message: string; id: number }> => {
    const response = await api.post(`/surveys/${surveyId}/submit`, { answers });
    return response.data;
  },

  getAll: async (surveyId: number): Promise<SurveyResponse[]> => {
    const response = await api.get(`/surveys/${surveyId}/responses`);
    return response.data;
  },

  getStatistics: async (surveyId: number): Promise<SurveyStatistics> => {
    const response = await api.get(`/surveys/${surveyId}/statistics`);
    return response.data;
  },
};
