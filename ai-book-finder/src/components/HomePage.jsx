import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import PhoneFrame from './PhoneFrame';

function HomePage() {
  const navigate = useNavigate();

  return (
    <PhoneFrame>
    <div className="page-container">
      {/* 显示你的首页截图 */}
      <img 
        src="/front_page_icon.png" 
        alt="微信读书首页"
        className="page-image"
      />

      {/* Ai 徽章的点击热区 - 圆心(367, 787)，半径38px */}
      <div 
        className="ai-hotspot"
        onClick={() => navigate('/chat')}
        title="点击进入 AI 找书"
      />
      </div>
    </PhoneFrame>
  );
}

export default HomePage;
