interface Step2Props {
  surveyType: 'single_page' | 'multi_page';
  setSurveyType: (val: 'single_page' | 'multi_page') => void;
  onBack: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export default function Step2SurveyType({
  surveyType,
  setSurveyType,
  onBack,
  onNext,
  onFinish,
}: Step2Props) {
  return (
    <div className="wizard-step">
      <h3>Шаг 2: Выбор типа опроса</h3>

      <div className="survey-type-selector">
        <div
          className={`type-card ${surveyType === 'single_page' ? 'selected' : ''}`}
          onClick={() => setSurveyType('single_page')}
        >
          <div className="type-icon">📄</div>
          <h4>Одностраничный</h4>
          <p>Все вопросы отображаются на одной странице. Подходит для коротких опросов.</p>
        </div>

        <div
          className={`type-card ${surveyType === 'multi_page' ? 'selected' : ''}`}
          onClick={() => setSurveyType('multi_page')}
        >
          <div className="type-icon">📑</div>
          <h4>Многостраничный</h4>
          <p>Вопросы распределены по страницам с возможностью настройки логики переходов.</p>
        </div>
      </div>

      <div className="wizard-actions">
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          Назад
        </button>
        {surveyType === 'single_page' ? (
          <button type="button" className="btn btn-primary" onClick={onFinish}>
            Создать опрос
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={onNext}>
            Далее: Настройка страниц
          </button>
        )}
      </div>
    </div>
  );
}
