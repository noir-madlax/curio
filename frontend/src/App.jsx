import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Survey from './pages/Survey/Survey';
import NewSurvey from './pages/NewSurvey/NewSurvey';
import SurveyPublished from './pages/SurveyPublished/SurveyPublished';
import SurveyChatPage from './pages/SurveyRespondent/SurveyChatPage';
import SurveyResult from './pages/SurveyResult/SurveyResult';
import SurveyInsight from './pages/SurveyInsight/SurveyInsight';
import SurveyResponse from './pages/SurveyResponse/SurveyResponse';
import SurveyView from './pages/SurveyView/SurveyView';
import SurveyThankYou from './pages/SurveyThankYou/SurveyThankYou';
import './App.css';

function RedirectToPreview() {
  const { id } = useParams();
  return <Navigate replace to={`/surveys/preview/${id}`} />;
}

function App() {
  return (
    <Router>
        <Routes>
        <Route path="/" element={<Navigate to="/surveys" replace />} />
        <Route path="/surveys" element={<Survey />} />
        <Route path="/surveys/new" element={<NewSurvey />} />
        <Route path="/surveys/edit/:id" element={<NewSurvey />} />
        <Route path="/surveys/preview/:id" element={<SurveyView />} />
        <Route path="/surveys/view/:id" element={<RedirectToPreview />} />
        <Route path="/surveys/:surveyId/results" element={<SurveyResult />} />
        <Route path="/survey-published/:surveyId" element={<SurveyPublished />} />
        <Route path="/insights" element={<SurveyInsight />} />
        <Route path="/surveys/:surveyId/insights" element={<SurveyInsight />} />
        <Route path="/analytics" element={<Survey />} />
        <Route path="/respondents" element={<Survey />} />
        <Route path="/settings" element={<Survey />} />
        <Route path="/help" element={<Survey />} />
        <Route path="/survey/:id/respond" element={<SurveyView />} />
        <Route path="/survey/:id/view/:responseId" element={<SurveyView />} />
        <Route path="/survey/:id/respond-chat" element={<SurveyChatPage />} />
        <Route path="/survey-thank-you/:id" element={<SurveyThankYou />} />
        </Routes>
    </Router>
  );
}

export default App; 