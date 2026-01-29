import { useState } from 'react';
import type { Question, PageConfig, TransitionRule } from '../../types';

interface Step3Props {
  questions: Question[];
  pages: PageConfig[];
  setPages: (val: PageConfig[]) => void;
  transitions: TransitionRule[];
  setTransitions: (val: TransitionRule[]) => void;
  onBack: () => void;
  onFinish: () => void;
}

export default function Step3PageConfig({
  questions,
  pages,
  setPages,
  transitions,
  setTransitions,
  onBack,
  onFinish,
}: Step3Props) {
  const [activeTab, setActiveTab] = useState<'pages' | 'transitions'>('pages');

  const addPage = () => {
    const newPage: PageConfig = {
      id: pages.length + 1,
      title: `Страница ${pages.length + 1}`,
      questionIds: [],
    };
    setPages([...pages, newPage]);
  };

  const removePage = (pageId: number) => {
    if (pages.length <= 1) return;
    setPages(pages.filter(p => p.id !== pageId));
    setTransitions(transitions.filter(t => t.fromPage !== pageId && t.toPage !== pageId));
  };

  const updatePageTitle = (pageId: number, title: string) => {
    setPages(pages.map(p => p.id === pageId ? { ...p, title } : p));
  };

  const toggleQuestionInPage = (pageId: number, questionIndex: number) => {
    setPages(pages.map(p => {
      if (p.id !== pageId) return p;
      const hasQuestion = p.questionIds.includes(questionIndex);
      return {
        ...p,
        questionIds: hasQuestion
          ? p.questionIds.filter(id => id !== questionIndex)
          : [...p.questionIds, questionIndex]
      };
    }));
  };

  const getQuestionPage = (questionIndex: number): number | null => {
    const page = pages.find(p => p.questionIds.includes(questionIndex));
    return page ? page.id : null;
  };

  const addTransition = () => {
    const newTransition: TransitionRule = {
      id: `t${Date.now()}`,
      fromPage: pages[0]?.id || 1,
      toPage: pages[1]?.id || 2,
    };
    setTransitions([...transitions, newTransition]);
  };

  const removeTransition = (id: string) => {
    setTransitions(transitions.filter(t => t.id !== id));
  };

  const updateTransition = (id: string, updates: Partial<TransitionRule>) => {
    setTransitions(transitions.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const updateTransitionCondition = (
    id: string,
    conditionUpdates: Partial<TransitionRule['condition']>
  ) => {
    setTransitions(transitions.map(t => {
      if (t.id !== id) return t;
      return {
        ...t,
        condition: {
          questionId: t.condition?.questionId ?? questions[0]?.position ?? 0,
          operator: t.condition?.operator ?? 'equals',
          value: t.condition?.value ?? '',
          ...conditionUpdates
        }
      };
    }));
  };

  const getQuestionsForPage = (pageId: number) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return [];
    return page.questionIds.map(idx => questions[idx]).filter(Boolean);
  };

  const allQuestionsAssigned = questions.every((_, idx) => getQuestionPage(idx) !== null);

  return (
    <div className="wizard-step">
      <h3>Шаг 3: Настройка страниц и переходов</h3>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'pages' ? 'active' : ''}`}
          onClick={() => setActiveTab('pages')}
        >
          Страницы
        </button>
        <button
          className={`tab ${activeTab === 'transitions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transitions')}
        >
          Логика переходов
        </button>
      </div>

      {activeTab === 'pages' && (
        <div className="pages-config">
          <div className="pages-list">
            {pages.map((page) => (
              <div key={page.id} className="page-config-card">
                <div className="page-header">
                  <input
                    type="text"
                    value={page.title}
                    onChange={e => updatePageTitle(page.id, e.target.value)}
                    className="page-title-input"
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => removePage(page.id)}
                    disabled={pages.length <= 1}
                  >
                    Удалить
                  </button>
                </div>

                <div className="page-questions">
                  <label>Вопросы на этой странице:</label>
                  <div className="question-checkboxes">
                    {questions.map((q, idx) => {
                      const assignedPage = getQuestionPage(idx);
                      const isAssignedHere = assignedPage === page.id;
                      const isAssignedElsewhere = assignedPage !== null && assignedPage !== page.id;

                      return (
                        <label
                          key={idx}
                          className={`question-checkbox ${isAssignedElsewhere ? 'disabled' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isAssignedHere}
                            onChange={() => toggleQuestionInPage(page.id, idx)}
                            disabled={isAssignedElsewhere}
                          />
                          <span className="question-preview">
                            {idx + 1}. {q.text || '(без текста)'}
                            {isAssignedElsewhere && (
                              <span className="assigned-badge">
                                (Страница {assignedPage})
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="btn btn-secondary" onClick={addPage}>
            + Добавить страницу
          </button>

          {!allQuestionsAssigned && (
            <div className="warning-message">
              Не все вопросы распределены по страницам
            </div>
          )}
        </div>
      )}

      {activeTab === 'transitions' && (
        <div className="transitions-config">
          <p className="transitions-description">
            Настройте порядок переходов между страницами. Вы можете добавить условия для перехода в зависимости от ответов.
          </p>

          {transitions.map((transition) => (
            <div key={transition.id} className="transition-card">
              <div className="transition-row">
                <label>Со страницы:</label>
                <select
                  value={transition.fromPage}
                  onChange={e => updateTransition(transition.id, { fromPage: Number(e.target.value) })}
                >
                  {pages.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>

                <span className="arrow">→</span>

                <label>На страницу:</label>
                <select
                  value={transition.toPage}
                  onChange={e => updateTransition(transition.id, { toPage: Number(e.target.value) })}
                >
                  {pages.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>

                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => removeTransition(transition.id)}
                >
                  X
                </button>
              </div>

              <div className="condition-section">
                <label>
                  <input
                    type="checkbox"
                    checked={!!transition.condition}
                    onChange={e => {
                      if (e.target.checked) {
                        updateTransitionCondition(transition.id, {});
                      } else {
                        updateTransition(transition.id, { condition: undefined });
                      }
                    }}
                  />
                  Добавить условие
                </label>

                {transition.condition && (
                  <div className="condition-fields">
                    <select
                      value={transition.condition.questionId}
                      onChange={e => updateTransitionCondition(transition.id, {
                        questionId: Number(e.target.value)
                      })}
                    >
                      {getQuestionsForPage(transition.fromPage).map((q, idx) => (
                        <option key={idx} value={q.position}>
                          {q.text || `Вопрос ${q.position + 1}`}
                        </option>
                      ))}
                    </select>

                    <select
                      value={transition.condition.operator}
                      onChange={e => updateTransitionCondition(transition.id, {
                        operator: e.target.value as 'equals' | 'not_equals' | 'contains'
                      })}
                    >
                      <option value="equals">Равно</option>
                      <option value="not_equals">Не равно</option>
                      <option value="contains">Содержит</option>
                    </select>

                    <input
                      type="text"
                      value={transition.condition.value as string}
                      onChange={e => updateTransitionCondition(transition.id, {
                        value: e.target.value
                      })}
                      placeholder="Значение"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          <button type="button" className="btn btn-secondary" onClick={addTransition}>
            + Добавить переход
          </button>
        </div>
      )}

      <div className="wizard-actions">
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          Назад
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onFinish}
          disabled={!allQuestionsAssigned}
        >
          Создать опрос
        </button>
      </div>
    </div>
  );
}
