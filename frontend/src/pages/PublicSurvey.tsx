import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { surveyService, responseService } from '../services/api';
import type { Survey, Answer, Question, ComboAnswer } from '../types';

export default function PublicSurvey() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<number, Answer['value'] | ComboAnswer>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (id) {
      loadSurvey(parseInt(id));
    }
  }, [id]);

  const loadSurvey = async (surveyId: number) => {
    try {
      const data = await surveyService.getById(surveyId);
      if (!data.isActive) {
        setError('Этот опрос неактивен');
        return;
      }
      setSurvey(data);
    } catch (err) {
      setError('Опрос не найден');
    } finally {
      setLoading(false);
    }
  };

  const isMultiPage = survey?.surveyType === 'multi_page';
  
  const pages = useMemo(() => {
    if (!survey?.questions) return [];
    if (!isMultiPage) {
      return [{ pageNumber: 1, questions: survey.questions }];
    }
    
    const pageMap = new Map<number, Question[]>();
    survey.questions.forEach(q => {
      const pageNum = q.pageNumber || 1;
      if (!pageMap.has(pageNum)) {
        pageMap.set(pageNum, []);
      }
      pageMap.get(pageNum)!.push(q);
    });
    
    return Array.from(pageMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([pageNumber, questions]) => ({ pageNumber, questions }));
  }, [survey, isMultiPage]);

  const totalPages = pages.length;
  const currentPageData = pages.find(p => p.pageNumber === currentPage);
  const currentQuestions = currentPageData?.questions || [];

  const getPageTitle = (pageNum: number) => {
    if (survey?.pages) {
      const pageConfig = survey.pages.find(p => p.id === pageNum);
      if (pageConfig?.title) return pageConfig.title;
    }
    return `Страница ${pageNum}`;
  };

  const updateAnswer = (questionId: number, value: Answer['value'] | ComboAnswer) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleMultipleChoice = (questionId: number, option: string, checked: boolean) => {
    const current = (answers[questionId] as string[]) || [];
    if (checked) {
      updateAnswer(questionId, [...current, option]);
    } else {
      updateAnswer(questionId, current.filter(o => o !== option));
    }
  };

  const handleRadioTextChange = (questionId: number, selected: string) => {
    const current = answers[questionId] as ComboAnswer | undefined;
    updateAnswer(questionId, { selected, text: current?.text || '' });
  };

  const handleRadioTextInput = (questionId: number, text: string) => {
    const current = answers[questionId] as ComboAnswer | undefined;
    updateAnswer(questionId, { selected: current?.selected || '', text });
  };

  const handleCheckboxTextChange = (questionId: number, option: string, checked: boolean) => {
    const current = answers[questionId] as ComboAnswer | undefined;
    const selectedArray = (current?.selected as string[]) || [];
    const newSelected = checked
      ? [...selectedArray, option]
      : selectedArray.filter(o => o !== option);
    updateAnswer(questionId, { selected: newSelected, text: current?.text || '' });
  };

  const handleCheckboxTextInput = (questionId: number, text: string) => {
    const current = answers[questionId] as ComboAnswer | undefined;
    updateAnswer(questionId, { selected: current?.selected || [], text });
  };

  const validateCurrentPage = (): boolean => {
    const requiredQuestions = currentQuestions.filter(q => q.isRequired);
    for (const q of requiredQuestions) {
      const answer = answers[q.id!];
      if (answer === undefined || answer === null) {
        setError(`Пожалуйста, ответьте на вопрос: "${q.text}"`);
        return false;
      }
      if (typeof answer === 'string' && answer === '') {
        setError(`Пожалуйста, ответьте на вопрос: "${q.text}"`);
        return false;
      }
      if (Array.isArray(answer) && answer.length === 0) {
        setError(`Пожалуйста, ответьте на вопрос: "${q.text}"`);
        return false;
      }
      if (typeof answer === 'object' && 'selected' in answer) {
        const combo = answer as ComboAnswer;
        if (!combo.selected || (Array.isArray(combo.selected) && combo.selected.length === 0)) {
          setError(`Пожалуйста, ответьте на вопрос: "${q.text}"`);
          return false;
        }
      }
    }
    setError(null);
    return true;
  };

  const findNextPage = (): number | null => {
    if (!survey?.transitions || survey.transitions.length === 0) {
      const currentIndex = pages.findIndex(p => p.pageNumber === currentPage);
      if (currentIndex < pages.length - 1) {
        return pages[currentIndex + 1].pageNumber;
      }
      return null;
    }

    const transitions = survey.transitions.filter(t => t.fromPage === currentPage);
    
    for (const transition of transitions) {
      if (transition.condition) {
        const { questionId, operator, value } = transition.condition;
        const answer = answers[questionId];
        let matches = false;

        if (answer !== undefined && answer !== null) {
          const answerStr = typeof answer === 'object' && 'selected' in answer
            ? String((answer as ComboAnswer).selected)
            : String(answer);
          
          switch (operator) {
            case 'equals':
              matches = answerStr === value;
              break;
            case 'not_equals':
              matches = answerStr !== value;
              break;
            case 'contains':
              matches = answerStr.includes(String(value));
              break;
          }
        }

        if (matches) {
          return transition.toPage;
        }
      } else {
        return transition.toPage;
      }
    }

    const currentIndex = pages.findIndex(p => p.pageNumber === currentPage);
    if (currentIndex < pages.length - 1) {
      return pages[currentIndex + 1].pageNumber;
    }
    return null;
  };

  const handleNextPage = () => {
    if (!validateCurrentPage()) return;
    
    const nextPage = findNextPage();
    if (nextPage !== null) {
      setCurrentPage(nextPage);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };

  const handlePrevPage = () => {
    const currentIndex = pages.findIndex(p => p.pageNumber === currentPage);
    if (currentIndex > 0) {
      setCurrentPage(pages[currentIndex - 1].pageNumber);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!survey || !id) return;

    if (!validateCurrentPage()) return;

    setSubmitting(true);
    setError(null);

    const formattedAnswers = Object.entries(answers).map(([questionId, value]) => {
      if (typeof value === 'object' && value !== null && 'selected' in value) {
        return {
          questionId: parseInt(questionId),
          value: { selected: value.selected, text: value.text },
        };
      }
      return {
        questionId: parseInt(questionId),
        value,
      };
    });

    try {
      await responseService.submit(parseInt(id), formattedAnswers);
      navigate('/thank-you');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка отправки ответов');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: Question, index: number) => {
    const globalIndex = survey?.questions?.findIndex(q => q.id === question.id) || index;
    
    return (
      <div key={question.id} className="question-wrapper">
        <div className="question-text">
          {globalIndex + 1}. {question.text}
          {question.isRequired && <span className="required"> *</span>}
        </div>

        {question.type === 'text' && (
          <textarea
            value={(answers[question.id!] as string) || ''}
            onChange={e => updateAnswer(question.id!, e.target.value)}
            placeholder="Введите ваш ответ..."
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '100px' }}
          />
        )}

        {question.type === 'rating' && (
          <div className="rating-scale">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
              <label key={rating} style={{
                padding: '0.75rem 1.25rem',
                border: `2px solid ${answers[question.id!] === rating ? '#667eea' : '#e2e8f0'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                background: answers[question.id!] === rating ? '#667eea' : 'white',
                color: answers[question.id!] === rating ? 'white' : '#333',
                transition: 'all 0.2s'
              }}>
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={rating}
                  checked={answers[question.id!] === rating}
                  onChange={() => updateAnswer(question.id!, rating)}
                  style={{ display: 'none' }}
                />
                {rating}
              </label>
            ))}
          </div>
        )}

        {question.type === 'single_choice' && question.options?.map(option => (
          <label key={option} className="radio-option">
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option}
              checked={answers[question.id!] === option}
              onChange={() => updateAnswer(question.id!, option)}
            />
            {option}
          </label>
        ))}

        {question.type === 'multiple_choice' && question.options?.map(option => (
          <label key={option} className="checkbox-option">
            <input
              type="checkbox"
              checked={((answers[question.id!] as string[]) || []).includes(option)}
              onChange={e => handleMultipleChoice(question.id!, option, e.target.checked)}
            />
            {option}
          </label>
        ))}

        {question.type === 'radio_text' && (
          <div className="combo-question">
            {question.options?.map(option => (
              <label key={option} className="radio-option">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={(answers[question.id!] as ComboAnswer)?.selected === option}
                  onChange={() => handleRadioTextChange(question.id!, option)}
                />
                {option}
              </label>
            ))}
            <div className="combo-text-field">
              <input
                type="text"
                placeholder="Дополнительный комментарий..."
                value={(answers[question.id!] as ComboAnswer)?.text || ''}
                onChange={e => handleRadioTextInput(question.id!, e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}
              />
            </div>
          </div>
        )}

        {question.type === 'checkbox_text' && (
          <div className="combo-question">
            {question.options?.map(option => (
              <label key={option} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={((answers[question.id!] as ComboAnswer)?.selected as string[] || []).includes(option)}
                  onChange={e => handleCheckboxTextChange(question.id!, option, e.target.checked)}
                />
                {option}
              </label>
            ))}
            <div className="combo-text-field">
              <input
                type="text"
                placeholder="Дополнительный комментарий..."
                value={(answers[question.id!] as ComboAnswer)?.text || ''}
                onChange={e => handleCheckboxTextInput(question.id!, e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="public-survey"><div className="loading">Загрузка опроса...</div></div>;
  if (error && !survey) return (
    <div className="public-survey">
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ color: '#e53e3e', marginBottom: '1rem' }}>{error}</h2>
        <p>Возможно, опрос был удален или деактивирован.</p>
      </div>
    </div>
  );
  if (!survey) return null;

  return (
    <div className="public-survey">
      <div className="survey-header">
        <h1>{survey.title}</h1>
        {survey.description && <p>{survey.description}</p>}
      </div>

      {isMultiPage && totalPages > 1 && (
        <div className="page-progress">
          <div className="page-indicator">
            {getPageTitle(currentPage)} ({pages.findIndex(p => p.pageNumber === currentPage) + 1} из {totalPages})
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((pages.findIndex(p => p.pageNumber === currentPage) + 1) / totalPages) * 100}%` }}
            />
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {currentQuestions.map((question, index) => renderQuestion(question, index))}

        <div className="submit-section" style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
          {isMultiPage && pages.findIndex(p => p.pageNumber === currentPage) > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrevPage}
              style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
            >
              Назад
            </button>
          )}
          
          <div style={{ marginLeft: 'auto' }}>
            {isMultiPage && findNextPage() !== null ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNextPage}
                style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
              >
                Далее
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
              >
                {submitting ? 'Отправка...' : 'Отправить ответы'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
