import React from 'react';
import './SimpleLayout.css';

/**
 * 简洁布局组件，不包含侧边栏，适用于问卷回答等公开页面
 * 2023-10-30: 创建用于问卷回答页面的简洁布局
 */
const SimpleLayout = ({ children }) => {
  return (
    <div className="simple-layout">
      <div className="simple-content">
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SimpleLayout; 