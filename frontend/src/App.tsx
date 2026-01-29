import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import SurveyList from './pages/SurveyList';
import SurveyEditor from './pages/SurveyEditor';
import SurveyWizard from './pages/SurveyWizard';
import SurveyResults from './pages/SurveyResults';
import PublicSurvey from './pages/PublicSurvey';
import ThankYou from './pages/ThankYou';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<SurveyList />} />
          <Route path="surveys/new" element={<SurveyWizard />} />
          <Route path="surveys/:id/edit" element={<SurveyEditor />} />
          <Route path="surveys/:id/results" element={<SurveyResults />} />
        </Route>
        <Route path="/survey/:id" element={<PublicSurvey />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
