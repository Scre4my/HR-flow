import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { surveyService, responseService } from '../services/api';
import type { Survey, SurveyStatistics } from '../types';

const COLORS = ['#667eea', '#764ba2', '#48bb78', '#ed8936', '#e53e3e', '#38b2ac', '#805ad5', '#dd6b20'];

export default function SurveyResults() {
  const { id } = useParams();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [stats, setStats] = useState<SurveyStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadData(parseInt(id));
    }
  }, [id]);

  const loadData = async (surveyId: number) => {
    try {
      const [surveyData, statsData] = await Promise.all([
        surveyService.getById(surveyId),
        responseService.getStatistics(surveyId),
      ]);
      setSurvey(surveyData);
      setStats(statsData);
    } catch (err) {
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!survey || !stats) return <div className="empty-state">Опрос не найден</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Результаты: {survey.title}</h2>
          <p style={{ color: '#718096' }}>{survey.description}</p>
        </div>
        <Link to="/admin" className="btn btn-secondary">
          Назад к списку
        </Link>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="stat-value">{stats.totalResponses}</div>
            <div style={{ color: '#718096' }}>Всего ответов</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="stat-value">{survey.questionsCount || 0}</div>
            <div style={{ color: '#718096' }}>Вопросов</div>
          </div>
        </div>
      </div>

      {stats.totalResponses === 0 ? (
        <div className="card empty-state">
          <p>Ответов пока нет</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Поделитесь ссылкой на опрос: {window.location.origin}/survey/{id}
          </p>
        </div>
      ) : (
        <div className="results-container">
          {stats.questions.map((question, index) => (
            <div key={question.questionId} className="stat-card">
              <h4>
                {index + 1}. {question.text}
              </h4>
              <p style={{ color: '#a0aec0', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Ответов: {question.totalAnswers}
              </p>

              {question.type === 'rating' && question.distribution && (
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '600', color: '#667eea' }}>
                      Средняя оценка: {question.average}
                    </span>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={Object.entries(question.distribution).map(([rating, count]) => ({
                        rating: `Оценка ${rating}`,
                        count,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="rating" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#667eea" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {(question.type === 'single_choice' || question.type === 'multiple_choice') && 
               question.optionCounts && Object.keys(question.optionCounts).length > 0 && (
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  <div className="chart-container" style={{ flex: 1, minWidth: '300px' }}>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={Object.entries(question.optionCounts).map(([option, count]) => ({
                            name: option,
                            value: count,
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {Object.entries(question.optionCounts).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    {Object.entries(question.optionCounts).map(([option, count], idx) => (
                      <div key={option} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        padding: '0.5rem',
                        borderLeft: `4px solid ${COLORS[idx % COLORS.length]}`,
                        marginBottom: '0.5rem',
                        background: '#f8fafc',
                        borderRadius: '0 4px 4px 0'
                      }}>
                        <span>{option}</span>
                        <span style={{ fontWeight: '600' }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {question.type === 'text' && question.answers && (
                <div className="text-answers">
                  {question.answers.length === 0 ? (
                    <p style={{ color: '#a0aec0' }}>Нет текстовых ответов</p>
                  ) : (
                    question.answers.map((answer, idx) => (
                      <div key={idx} className="text-answer-item">
                        "{answer}"
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
