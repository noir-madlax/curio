import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content">
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
 