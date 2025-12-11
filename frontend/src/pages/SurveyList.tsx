import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { surveyService } from '../services/api';
import type { Survey } from '../types';

export default function SurveyList() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      const data = await surveyService.getAll();
      setSurveys(data);
    } catch (err) {
      setError('Ошибка загрузки опросов');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const updated = await surveyService.toggle(id);
      setSurveys(surveys.map(s => s.id === id ? { ...s, isActive: updated.isActive } : s));
    } catch (err) {
      setError('Ошибка изменения статуса');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот опрос?')) return;
    try {
      await surveyService.delete(id);
      setSurveys(surveys.filter(s => s.id !== id));
    } catch (err) {
      setError('Ошибка удаления опроса');
    }
  };

  const copyLink = (id: number) => {
    const url = `${window.location.origin}/survey/${id}`;
    navigator.clipboard.writeText(url);
    alert('Ссылка скопирована!');
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Опросы</h2>
        <Link to="/admin/surveys/new" className="btn btn-primary">
          + Создать опрос
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {surveys.length === 0 ? (
        <div className="card empty-state">
          <p>Опросы пока не созданы</p>
          <Link to="/admin/surveys/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Создать первый опрос
          </Link>
        </div>
      ) : (
        surveys.map(survey => (
          <div key={survey.id} className="card survey-card">
            <div className="survey-info">
              <h3>{survey.title}</h3>
              {survey.description && <p>{survey.description}</p>}
              <div className="survey-meta">
                <span>Вопросов: {survey.questionsCount || 0}</span>
                <span>Ответов: {survey.responsesCount || 0}</span>
                <span>Создан: {survey.createdAt}</span>
              </div>
              <div className="copy-link">
                <input 
                  type="text" 
                  readOnly 
                  value={`${window.location.origin}/survey/${survey.id}`} 
                />
                <button className="btn btn-sm btn-secondary" onClick={() => copyLink(survey.id!)}>
                  Копировать
                </button>
              </div>
            </div>
            <div className="survey-actions">
              <span className={`badge ${survey.isActive ? 'badge-active' : 'badge-inactive'}`}>
                {survey.isActive ? 'Активен' : 'Неактивен'}
              </span>
              <button 
                className={`btn btn-sm ${survey.isActive ? 'btn-secondary' : 'btn-success'}`}
                onClick={() => handleToggle(survey.id!)}
              >
                {survey.isActive ? 'Деактивировать' : 'Активировать'}
              </button>
              <Link to={`/admin/surveys/${survey.id}/edit`} className="btn btn-sm btn-secondary">
                Редактировать
              </Link>
              <Link to={`/admin/surveys/${survey.id}/results`} className="btn btn-sm btn-primary">
                Результаты
              </Link>
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(survey.id!)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
