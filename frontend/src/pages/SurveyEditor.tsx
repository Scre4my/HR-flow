import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { surveyService } from '../services/api';
import type { Survey, Question } from '../types';

const questionTypes = [
  { value: 'text', label: 'Текстовый ответ' },
  { value: 'single_choice', label: 'Один вариант' },
  { value: 'multiple_choice', label: 'Множественный выбор' },
  { value: 'rating', label: 'Шкала оценки (1-10)' },
];

const emptyQuestion: Question = {
  text: '',
  type: 'text',
  options: [],
  isRequired: true,
  position: 0,
};

export default function SurveyEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([{ ...emptyQuestion }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadSurvey(parseInt(id));
    }
  }, [id]);

  const loadSurvey = async (surveyId: number) => {
    setLoading(true);
    try {
      const survey = await surveyService.getById(surveyId);
      setTitle(survey.title);
      setDescription(survey.description || '');
      setIsActive(survey.isActive);
      setQuestions(survey.questions?.length ? survey.questions : [{ ...emptyQuestion }]);
    } catch (err) {
      setError('Ошибка загрузки опроса');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { ...emptyQuestion, position: questions.length }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    const options = updated[questionIndex].options || [];
    updated[questionIndex].options = [...options, ''];
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    const options = [...(updated[questionIndex].options || [])];
    options[optionIndex] = value;
    updated[questionIndex].options = options;
    setQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    const options = (updated[questionIndex].options || []).filter((_, i) => i !== optionIndex);
    updated[questionIndex].options = options;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Введите название опроса');
      return;
    }

    const validQuestions = questions.filter(q => q.text.trim());
    if (validQuestions.length === 0) {
      setError('Добавьте хотя бы один вопрос');
      return;
    }

    setLoading(true);
    setError(null);

    const surveyData: Partial<Survey> = {
      title,
      description: description || undefined,
      isActive,
      questions: validQuestions.map((q, i) => ({
        ...q,
        position: i,
        options: q.options?.filter(o => o.trim()),
      })),
    };

    try {
      if (isEdit && id) {
        await surveyService.update(parseInt(id), surveyData);
      } else {
        await surveyService.create(surveyData);
      }
      navigate('/admin');
    } catch (err) {
      setError('Ошибка сохранения опроса');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) return <div className="loading">Загрузка...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>{isEdit ? 'Редактирование опроса' : 'Новый опрос'}</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="form-group">
            <label>Название опроса *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Например: Оценка удовлетворенности сотрудников"
            />
          </div>

          <div className="form-group">
            <label>Описание</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Краткое описание опроса для респондентов"
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              Опрос активен
            </label>
          </div>
        </div>

        <h3 style={{ margin: '2rem 0 1rem' }}>Вопросы</h3>

        {questions.map((question, qIndex) => (
          <div key={qIndex} className="question-card">
            <div className="question-header">
              <span className="question-number">{qIndex + 1}</span>
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={() => removeQuestion(qIndex)}
                disabled={questions.length === 1}
              >
                Удалить
              </button>
            </div>

            <div className="form-group">
              <label>Текст вопроса *</label>
              <input
                type="text"
                value={question.text}
                onChange={e => updateQuestion(qIndex, { text: e.target.value })}
                placeholder="Введите вопрос"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Тип вопроса</label>
                <select
                  value={question.type}
                  onChange={e => updateQuestion(qIndex, { 
                    type: e.target.value as Question['type'],
                    options: ['single_choice', 'multiple_choice'].includes(e.target.value) ? [''] : []
                  })}
                >
                  {questionTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={question.isRequired}
                    onChange={e => updateQuestion(qIndex, { isRequired: e.target.checked })}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Обязательный
                </label>
              </div>
            </div>

            {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
              <div className="options-list">
                <label>Варианты ответов</label>
                {(question.options || []).map((option, oIndex) => (
                  <div key={oIndex} className="option-item">
                    <input
                      type="text"
                      value={option}
                      onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                      placeholder={`Вариант ${oIndex + 1}`}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => removeOption(qIndex, oIndex)}
                    >
                      X
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => addOption(qIndex)}
                >
                  + Добавить вариант
                </button>
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          className="btn btn-secondary"
          onClick={addQuestion}
          style={{ marginBottom: '2rem' }}
        >
          + Добавить вопрос
        </button>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Сохранение...' : (isEdit ? 'Сохранить изменения' : 'Создать опрос')}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/admin')}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
