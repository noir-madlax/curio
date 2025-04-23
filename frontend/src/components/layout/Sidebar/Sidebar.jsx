import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

// 导入SVG图标
import curioLogo from '../../../assets/icons/Curio_logo.svg';
import surveyIcon from '../../../assets/icons/survey_icon.svg';
import analyticsIcon from '../../../assets/icons/analytics_icon.svg';
import respondentsIcon from '../../../assets/icons/respondents_icon.svg';
import settingsIcon from '../../../assets/icons/settings_icon.svg';
import helpIcon from '../../../assets/icons/help_icon.svg';

// 创建图标组件
const LogoIcon = () => <div className="logo-icon">C</div>; // 保留文字Logo，因为这是设计要求
const SurveyIcon = () => <img src={surveyIcon} alt="Surveys" className="nav-icon-img" />;
const AnalyticsIcon = () => <img src={analyticsIcon} alt="Analytics" className="nav-icon-img" />;
const RespondentsIcon = () => <img src={respondentsIcon} alt="Respondents" className="nav-icon-img" />;
const SettingsIcon = () => <img src={settingsIcon} alt="Settings" className="nav-icon-img" />;
const HelpIcon = () => <img src={helpIcon} alt="Help" className="nav-icon-img" />;

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-header">
          <div className="logo-container">
            <LogoIcon />
            <div className="logo-text">
              <h1>Curio</h1>
              <p>powered by 3PO Lab</p>
            </div>
          </div>
        </div>
        
        <div className="sidebar-section">
          <h2 className="section-title">MAIN</h2>
          <ul className="nav-list">
            <li className="nav-item">
              <NavLink to="/surveys" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                <div className="nav-icon">
                  <SurveyIcon />
                </div>
                <span>Surveys</span>
                <span className="new-badge">New</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/analytics" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                <div className="nav-icon">
                  <AnalyticsIcon />
                </div>
                <span>Analytics</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/respondents" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                <div className="nav-icon">
                  <RespondentsIcon />
                </div>
                <span>Respondents</span>
              </NavLink>
            </li>
          </ul>
        </div>
        
        <div className="sidebar-section">
          <h2 className="section-title">SETTINGS</h2>
          <ul className="nav-list">
            <li className="nav-item">
              <NavLink to="/settings" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                <div className="nav-icon">
                  <SettingsIcon />
                </div>
                <span>Settings</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/help" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                <div className="nav-icon">
                  <HelpIcon />
                </div>
                <span>Help & Support</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="user-profile">
        <div className="user-avatar">YH</div>
        <div className="user-info">
          <p className="user-name">Yusuf Hilmi</p>
          <p className="user-email">yusuf@example.com</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 