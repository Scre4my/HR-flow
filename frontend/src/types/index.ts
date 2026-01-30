export interface Question {
  id?: number;
  text: string;
  type: 'text' | 'single_choice' | 'multiple_choice' | 'rating' | 'radio_text' | 'checkbox_text';
  options?: string[];
  isRequired: boolean;
  position: number;
  pageNumber?: number | null;
}

export interface ComboAnswer {
  selected: string | string[];
  text?: string;
}

export interface PageConfig {
  id: number;
  title: string;
  questionIds: number[];
}

export interface TransitionRule {
  id: string;
  fromPage: number;
  toPage: number;
  condition?: {
    questionId: number;
    operator: 'equals' | 'not_equals' | 'contains';
    value: string | string[];
  };
}

export interface Survey {
  id?: number;
  title: string;
  description?: string;
  isActive: boolean;
  surveyType: 'single_page' | 'multi_page';
  pages?: PageConfig[];
  transitions?: TransitionRule[];
  createdAt?: string;
  updatedAt?: string;
  questionsCount?: number;
  responsesCount?: number;
  questions?: Question[];
}

export interface Answer {
  questionId: number;
  value: string | string[] | number | null | ComboAnswer;
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
