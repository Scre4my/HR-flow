import type { Question } from '../../types';

const questionTypes = [
  { value: 'text', label: 'Текстовый ответ' },
  { value: 'single_choice', label: 'Один вариант' },
  { value: 'multiple_choice', label: 'Множественный выбор' },
  { value: 'rating', label: 'Шкала оценки (1-10)' },
  { value: 'radio_text', label: 'Один вариант + текст' },
  { value: 'checkbox_text', label: 'Множественный выбор + текст' },
];

interface Step1Props {
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  questions: Question[];
  setQuestions: (val: Question[]) => void;
  onNext: () => void;
}

const emptyQuestion: Question = {
  text: '',
  type: 'text',
  options: [],
  isRequired: true,
  position: 0,
};

export default function Step1Questions({
  title,
  setTitle,
  description,
  setDescription,
  questions,
  setQuestions,
  onNext,
}: Step1Props) {
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

  const canProceed = title.trim() && questions.some(q => q.text.trim());

  return (
    <div className="wizard-step">
      <h3>Шаг 1: Создание вопросов</h3>

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
      </div>

      <h4 style={{ margin: '2rem 0 1rem' }}>Вопросы</h4>

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
                  options: ['single_choice', 'multiple_choice', 'radio_text', 'checkbox_text'].includes(e.target.value) ? [''] : []
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

          {['single_choice', 'multiple_choice', 'radio_text', 'checkbox_text'].includes(question.type) && (
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

      <div className="wizard-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onNext}
          disabled={!canProceed}
        >
          Далее: Тип опроса
        </button>
      </div>
    </div>
  );
}
