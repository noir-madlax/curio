import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Survey from './pages/Survey/Survey';
import NewSurvey from './pages/NewSurvey/NewSurvey';
import SurveyPublished from './pages/SurveyPublished/SurveyPublished';
import SurveyChatPage from './pages/SurveyRespondent/SurveyChatPage';
import SurveyResult from './pages/SurveyResult/SurveyResult';
import SurveyInsight from './pages/SurveyInsight/SurveyInsight';
import SurveyPreview from './pages/SurveyPreview/SurveyPreview';
import SurveyResponse from './pages/SurveyResponse/SurveyResponse';
import SurveyView from './pages/SurveyView/SurveyView';
import SurveyThankYou from './pages/SurveyThankYou/SurveyThankYou';
import './App.css';

function App() {
  return (
    <Router>
        <Routes>
        <Route path="/" element={<Navigate to="/surveys" replace />} />
        <Route path="/surveys" element={<Survey />} />
        <Route path="/surveys/new" element={<NewSurvey />} />
        <Route path="/surveys/edit/:id" element={<NewSurvey />} />
        <Route path="/surveys/preview/:id" element={<SurveyView />} />
        <Route path="/surveys/view/:id" element={<NewSurvey viewMode={true} />} />
        <Route path="/surveys/:surveyId/results" element={<SurveyResult />} />
        <Route path="/survey-published/:surveyId" element={<SurveyPublished />} />
        <Route path="/insights" element={<SurveyInsight />} />
        <Route path="/surveys/:surveyId/insights" element={<SurveyInsight />} />
        <Route path="/analytics" element={<Survey />} />
        <Route path="/respondents" element={<Survey />} />
        <Route path="/settings" element={<Survey />} />
        <Route path="/help" element={<Survey />} />
        <Route path="/survey/:surveyId/respond" element={<SurveyView />} />
        <Route path="/survey/:surveyId/view/:responseId" element={<SurveyView />} />
        <Route path="/survey/:surveyId/respond-chat" element={<SurveyChatPage />} />
        <Route path="/survey-thank-you/:id" element={<SurveyThankYou />} />
        </Routes>
    </Router>
  );
}

export default App; 