import React from 'react';
import './About.css';

function About() {
  return (
    <div className="container about-page">
      <h2>关于我们</h2>
      <p>
        这是一个使用React和Python搭建的全栈应用程序。该项目展示了如何将React前端与Python后端集成。
      </p>
      <div className="tech-stack">
        <h3>技术栈:</h3>
        <div className="tech-list">
          <div className="tech-item">
            <h4>前端</h4>
            <ul>
              <li>React</li>
              <li>React Router</li>
              <li>Axios</li>
              <li>Vite</li>
            </ul>
          </div>
          <div className="tech-item">
            <h4>后端</h4>
            <ul>
              <li>Python</li>
              <li>Flask/FastAPI</li>
              <li>SQLAlchemy</li>
              <li>SQLite/PostgreSQL</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About; 