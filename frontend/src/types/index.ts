export interface Question {
  id?: number;
  text: string;
  type: 'text' | 'single_choice' | 'multiple_choice' | 'rating';
  options?: string[];
  isRequired: boolean;
  position: number;
}

export interface Survey {
  id?: number;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  questionsCount?: number;
  responsesCount?: number;
  questions?: Question[];
}

export interface Answer {
  questionId: number;
  value: string | string[] | number | null;
}

export interface SurveyResponse {
  id?: number;
  surveyId: number;
  submittedAt?: string;
  answers: Answer[];
}

export interface QuestionStats {
  questionId: number;
  text: string;
  type: string;
  totalAnswers: number;
  average?: number;
  distribution?: Record<number, number>;
  optionCounts?: Record<string, number>;
  answers?: string[];
}

export interface SurveyStatistics {
  surveyId: number;
  totalResponses: number;
  questions: QuestionStats[];
}
