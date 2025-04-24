import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Survey from './pages/Survey/Survey';
import NewSurvey from './pages/NewSurvey/NewSurvey';
import SurveyPublished from './pages/SurveyPublished/SurveyPublished';
import SurveyChatPage from './pages/SurveyRespondent/SurveyChatPage';
import './App.css';

function App() {
  return (
    <Router>
        <Routes>
        <Route path="/" element={<Navigate to="/surveys" replace />} />
        <Route path="/surveys" element={<Survey />} />
        <Route path="/surveys/new" element={<NewSurvey />} />
        <Route path="/surveys/edit/:id" element={<NewSurvey />} />
        <Route path="/surveys/view/:id" element={<NewSurvey viewMode={true} />} />
        <Route path="/survey-published/:surveyId" element={<SurveyPublished />} />
        <Route path="/analytics" element={<Survey />} />
        <Route path="/respondents" element={<Survey />} />
        <Route path="/settings" element={<Survey />} />
        <Route path="/help" element={<Survey />} />
        <Route path="/survey/:surveyId/respond" element={<SurveyChatPage />} />
        </Routes>
    </Router>
  );
}

export default App; 