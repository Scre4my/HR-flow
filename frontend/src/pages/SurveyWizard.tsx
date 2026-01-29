import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { surveyService } from '../services/api';
import Step1Questions from '../components/wizard/Step1Questions';
import Step2SurveyType from '../components/wizard/Step2SurveyType';
import Step3PageConfig from '../components/wizard/Step3PageConfig';
import type { Question, PageConfig, TransitionRule, Survey } from '../types';

const emptyQuestion: Question = {
  text: '',
  type: 'text',
  options: [],
  isRequired: true,
  position: 0,
};

export default function SurveyWizard() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([{ ...emptyQuestion }]);
  const [surveyType, setSurveyType] = useState<'single_page' | 'multi_page'>('single_page');
  const [pages, setPages] = useState<PageConfig[]>([
    { id: 1, title: 'Страница 1', questionIds: [] }
  ]);
  const [transitions, setTransitions] = useState<TransitionRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async () => {
    setLoading(true);
    setError(null);

    const validQuestions = questions.filter(q => q.text.trim());
    
    let finalQuestions = validQuestions.map((q, i) => ({
      ...q,
      position: i,
      options: q.options?.filter(o => o.trim()),
      pageNumber: surveyType === 'multi_page'
        ? pages.find(p => p.questionIds.includes(i))?.id ?? null
        : null,
    }));

    const surveyData: Partial<Survey> = {
      title,
      description: description || undefined,
      isActive: true,
      surveyType,
      questions: finalQuestions,
      pages: surveyType === 'multi_page' ? pages : undefined,
      transitions: surveyType === 'multi_page' && transitions.length > 0 ? transitions : undefined,
    };

    try {
      await surveyService.create(surveyData);
      navigate('/admin');
    } catch (err) {
      setError('Ошибка сохранения опроса');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1Questions
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            questions={questions}
            setQuestions={setQuestions}
            onNext={() => setStep(2)}
          />
        );
      case 2:
        return (
          <Step2SurveyType
            surveyType={surveyType}
            setSurveyType={setSurveyType}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            onFinish={handleFinish}
          />
        );
      case 3:
        return (
          <Step3PageConfig
            questions={questions}
            pages={pages}
            setPages={setPages}
            transitions={transitions}
            setTransitions={setTransitions}
            onBack={() => setStep(2)}
            onFinish={handleFinish}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="survey-wizard">
      <div className="page-header">
        <h2>Создание опроса</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
          Отмена
        </button>
      </div>

      <div className="wizard-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Вопросы</span>
        </div>
        <div className="progress-line"></div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Тип опроса</span>
        </div>
        <div className="progress-line"></div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Настройка</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Сохранение...</div>}

      {renderStep()}
    </div>
  );
}
