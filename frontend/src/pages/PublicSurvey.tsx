import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { surveyService, responseService } from '../services/api';
import type { Survey, Answer } from '../types';

export default function PublicSurvey() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<number, Answer['value']>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const updateAnswer = (questionId: number, value: Answer['value']) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey || !id) return;

    const requiredQuestions = survey.questions?.filter(q => q.isRequired) || [];
    for (const q of requiredQuestions) {
      const answer = answers[q.id!];
      if (answer === undefined || answer === null || answer === '' || 
          (Array.isArray(answer) && answer.length === 0)) {
        setError(`Пожалуйста, ответьте на вопрос: "${q.text}"`);
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    const formattedAnswers = Object.entries(answers).map(([questionId, value]) => ({
      questionId: parseInt(questionId),
      value,
    }));

    try {
      await responseService.submit(parseInt(id), formattedAnswers);
      navigate('/thank-you');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка отправки ответов');
    } finally {
      setSubmitting(false);
    }
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

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {survey.questions?.map((question, index) => (
          <div key={question.id} className="question-wrapper">
            <div className="question-text">
              {index + 1}. {question.text}
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
          </div>
        ))}

        <div className="submit-section">
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
            {submitting ? 'Отправка...' : 'Отправить ответы'}
          </button>
        </div>
      </form>
    </div>
  );
}
