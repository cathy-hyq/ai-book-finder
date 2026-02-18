import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PhoneFrame from './PhoneFrame';
import './BookDetail.css';

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <PhoneFrame>
      <div className="book-detail-container">
        {/* 显示书籍详情截图 */}
        <img 
          src={`/book_details/${id}.png`}
          alt={`书籍详情 ${id}`}
          className="book-detail-image"
        />

        {/* 返回按钮热区 - 箭头位置: 左端(20,84), 右上端(60,53) */}
        <div 
          className="book-back-hotspot"
          onClick={() => navigate(-1)}
          title="返回"
        />
      </div>
    </PhoneFrame>
  );
}

export default BookDetail;
