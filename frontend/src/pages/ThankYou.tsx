import { Link } from 'react-router-dom';

export default function ThankYou() {
  return (
    <div className="thank-you-page">
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>&#10003;</div>
      <h1>Спасибо за участие!</h1>
      <p style={{ color: '#718096', fontSize: '1.2rem', marginBottom: '2rem' }}>
        Ваши ответы успешно отправлены.
      </p>
      <Link to="/" className="btn btn-primary">
        На главную
      </Link>
    </div>
  );
}
