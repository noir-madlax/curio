import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import SurveyCard from '../../components/feature/Survey/SurveyCard/SurveyCard';
import Button from '../../components/common/Button/Button';
import { FullPageLoading } from '../../components/common/Loading';
import SurveyHeader from '../../components/common/SurveyHeader';
import './Survey.css';
import { getAllSurveys } from '../../services/surveyService';

// 导入SVG图标
import addIcon from '../../assets/icons/add_icon.svg';

// 创建图标组件
const AddIcon = () => <img src={addIcon} alt="Add" className="add-icon" />;

const Survey = () => {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchSurveys = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedSurveys = await getAllSurveys();
      setSurveys(fetchedSurveys);
    } catch (err) {
      console.error("Failed to fetch surveys:", err);
      setError(err.message || 'Unable to load survey list');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSurveys();
  }, []);

  const handleNewSurvey = () => {
    navigate('/surveys/new');
  };
  
  // 2024-08-07T16:15:00Z 新增：处理问卷删除
  const handleSurveyDelete = (deletedId) => {
    // 从当前列表中移除已删除的问卷
    setSurveys(surveys.filter(survey => survey.id !== deletedId));
  };
  
  const renderContent = () => {
    if (isLoading) {
      return <FullPageLoading message="Loading surveys..." />;
    }
    if (error) {
      return <div className="error-message">Error: {error}</div>;
    }
    if (surveys.length === 0) {
      return <div className="empty-message">No surveys yet. Click "New Survey" to create one!</div>;
    }
    return (
      <div className="surveys-grid">
        {surveys.map(survey => (
          <SurveyCard 
            key={survey.id} 
            survey={survey} 
            onDelete={handleSurveyDelete} // 2024-08-07T16:15:00Z 新增：传递删除回调
          />
        ))}
      </div>
    );
  };

  return (
    <MainLayout>
      <SurveyHeader
        title="Surveys"
        rightContent={
        <Button 
          variant="primary" 
          icon={<AddIcon />}
          onClick={handleNewSurvey}
        >
          New Survey
        </Button>
        }
      />
      
      {renderContent()}
    </MainLayout>
  );
};

export default Survey; 