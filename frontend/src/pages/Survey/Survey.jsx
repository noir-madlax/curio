import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import SurveyCard from '../../components/feature/Survey/SurveyCard/SurveyCard';
import Button from '../../components/common/Button/Button';
import './Survey.css';

// 导入SVG图标
import addIcon from '../../assets/icons/add_icon.svg';

// 创建图标组件
const AddIcon = () => <img src={addIcon} alt="Add" className="add-icon" />;

const Survey = () => {
  const navigate = useNavigate();
  
  // 处理点击"New Survey"按钮
  const handleNewSurvey = () => {
    navigate('/surveys/new');
  };
  
  // 模拟数据
  const surveys = [
    {
      id: 1,
      title: 'Employee Engagement Survey',
      status: 'Published',
      updatedAt: 'over 1 year ago',
      responses: 85,
      completionRate: 92,
    },
    {
      id: 2,
      title: 'Product Feedback Survey',
      status: 'Draft',
      updatedAt: 'over 1 year ago',
      responses: 0,
      completionRate: 0,
    },
    {
      id: 3,
      title: 'Customer Satisfaction Survey',
      status: 'Draft',
      updatedAt: 'over 1 year ago',
      responses: 0,
      completionRate: 0,
    },
  ];

  return (
    <MainLayout>
      <div className="survey-header">
        <div className="page-title">
          <h1>Surveys</h1>
        </div>
        
        <Button 
          variant="primary" 
          icon={<AddIcon />}
          onClick={handleNewSurvey}
        >
          New Survey
        </Button>
      </div>
      
      <div className="surveys-grid">
        {surveys.map(survey => (
          <SurveyCard key={survey.id} survey={survey} />
        ))}
      </div>
    </MainLayout>
  );
};

export default Survey; 